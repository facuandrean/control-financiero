import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../../config';

/**
 * Instancia preconfigurada de Axios para llamadas de la aplicación.
 * Permite que las cookies HttpOnly viajen automáticamente en cada petición.
 */
export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Cliente aislado exclusivamente para renovar el token.
 * No comparte interceptores con 'api' para evitar cualquier bucle de llamadas.
 */
const refreshClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback desacoplado para notificar al store cuando la autenticación expira irremediablemente
let onAuthFailureCallback: (() => void) | null = null;

export const setOnAuthFailure = (callback: () => void) => {
  onAuthFailureCallback = callback;
};

// Variables para control de concurrencia (Mutex/Queue)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Interceptor de RESPONSE: Manejo automático del Refresh Token ante 401.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Si no hay respuesta o no es 401, rechazar normalmente
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';

    // NUNCA interceptar errores 401 en login, register o refresh
    // Esto permite que useLogin o useRegister muestren sus propios mensajes de error al usuario
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Si ya se intentó reintentar esta petición y volvió a fallar, rechazar
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si ya se está ejecutando un refresh de token por otra petición simultánea, encolar
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Disparar la renovación con el cliente aislado
      await refreshClient.post('/auth/refresh');
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);
      
      // Notificar al store de autenticación para limpiar el estado y forzar redirección limpia
      if (onAuthFailureCallback) {
        onAuthFailureCallback();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
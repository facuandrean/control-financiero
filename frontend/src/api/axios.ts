// Este archivo configura cómo tu frontend le habla al backend.

import axios from 'axios';
import { config } from '../../config';

/**
 * Instancia preconfigurada de Axios para realizar peticiones a la API.
 * 
 * - Usa como base la URL definida en la configuración (`config.apiUrl`).
 * - Envía las cookies (útil para manejar sesiones/token refresh en el backend).
 * - Configura los headers para enviar y recibir datos en formato JSON.
 *
 * Utilizá esta instancia (`api`) para todas las llamadas HTTP del frontend 
 * que deban ir autenticadas o requieran la baseURL/API centralizada.
 */
export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // Permite enviar/recibir cookies. Le dice al navegador: "Cuando hables con este servidor, envíale las cookies que tengas guardadas para él". Sin esto, el backend nunca recibiría la cookie del refreshToken y el login fallaría.
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de peticiones de Axios.
 *
 * Antes de que cada request salga, agrega el header `Authorization` con el accessToken almacenado en localStorage,
 * siempre y cuando exista uno. Esto permite autenticar todas las peticiones protegidas automáticamente.
 *
 * @param {import('axios').AxiosRequestConfig} config - La configuración original de la petición.
 * @returns {import('axios').AxiosRequestConfig} - La configuración modificada con el header Authorization, si aplica.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  
  (error) => Promise.reject(error)
);

// Interceptor de Response (Cuando el servidor responde): Manejo automático del Refresh Token
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la devolvemos tal cual.
  async (error) => {
    // Si el servidor responde "401 Unauthorized"
    const originalRequest = error.config;

    // Si el error es 401 y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca para no entrar en bucle infinito

      try {
        // Llamamos al endpoint de refresh, para obtener un nuevo accessToken, debido a que el accessToken ha expirado.
        // Nota: No enviamos token, el backend lee la cookie automáticamente. La cookie viaja sola gracias a withCredentials.
        const { data } = await api.post('/auth/refresh');
        
        // Guardamos el nuevo token
        localStorage.setItem('accessToken', data.data.accessToken);
        
        // Actualizamos el header de la petición original, es decir, le agregamos el nuevo accessToken para volver a reintentar la petición.
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        
        // Reintentamos la petición original.
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, el usuario perdió la sesión
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Redirigir al login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
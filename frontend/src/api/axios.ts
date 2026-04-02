import axios from 'axios';
import { config } from '../../config';

/**
 * Instancia preconfigurada de Axios.
 * * Al usar Cookies HttpOnly, ya no necesitamos interceptores de REQUEST 
 * para leer el localStorage. El navegador adjunta las cookies automáticamente.
 */
export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // INDISPENSABLE: Permite que las cookies viajen en cada petición.
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de RESPONSE: Manejo automático del Refresh Token.
 * * Si una petición falla con 401 (Unauthorized), intentamos renovar el Access Token
 * llamando al endpoint /refresh. El backend leerá la cookie refreshToken y,
 * si es válida, seteará una NUEVA cookie accessToken.
 */
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un reintento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        /**
         * Llamamos al endpoint de refresh. 
         * No enviamos nada en el cuerpo ni en headers.
         * El backend recibe la cookie 'refreshToken' automáticamente.
         */
        await api.post('/auth/refresh');
        
        /**
         * Si el refresh fue exitoso, el backend ya nos envió una nueva cookie 'accessToken'.
         * Simplemente reintentamos la petición original. 
         * Ya NO editamos headers.Authorization porque ahora es una cookie.
         */
        return api(originalRequest);
      } catch (refreshError) {
        /**
         * Si el refresh falla (ej: la sesión expiró en el servidor), 
         * redirigimos al login. El backend en el catch del refresh 
         * debería limpiar las cookies también.
         */
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
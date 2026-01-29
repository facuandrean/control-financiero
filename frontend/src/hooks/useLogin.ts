import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import type { LoginInput } from '../types/auth.types';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usamos el hook de React Router para navegar a la página deseada
  const navigate = useNavigate();

  // Usamos el store de Zustand para guardar el token y el usuario en el estado global
  const { setToken, setUser } = useAuthStore();

  const login = async (credentials: LoginInput) => {
    // Mostramos el spinner de carga
    setLoading(true);
    setError(null);

    try {
      // Llamamos al endpoint de login del backend
      const response = await api.post('/auth/login', credentials);
      console.log('response', response);

      // Guardamos el usuario y el token en el store de Zustand
      const { user, accessToken } = response.data.data;
      setToken(accessToken);
      setUser(user);

      navigate('/'); // Redirigimos al Dashboard
    } catch (err: any) {
      // Mostramos el mensaje de error
      console.log(err);
      const errorMsg = err.response?.data?.message || 'Email o contraseña incorrectos';
      setError(errorMsg);
    } finally {
      // Ocultamos el spinner de carga
      setLoading(false);
    }
  };

  return { login, loading, error, setError }; // Devolvemos setError por si se desea limpiar el error manualmente
};
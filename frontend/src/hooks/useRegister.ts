import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import type { RegisterInput } from '../types/auth.types';
import { useAuthStore } from '../store/authStore';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usamos el hook de React Router para navegar a la página deseada
  const navigate = useNavigate();

  // Usamos el store de Zustand para guardar el token y el usuario en el estado global
  const { setToken, setUser } = useAuthStore();

  const register = async (credentials: RegisterInput) => {
    // Mostramos el spinner de carga
    setLoading(true);
    setError(null);

    try {
      // Llamamos al endpoint de login del backend
      const response = await api.post('/auth/register', credentials);

      if (response.status === 201) {
        // Llamamos al endpoint de login del backend
        const loginResponse = await api.post('/auth/login', credentials);

        // Guardamos el usuario y el token en el store de Zustand
        const { user, accessToken } = loginResponse.data.data;
        setToken(accessToken);
        setUser(user);

        navigate('/'); // Redirigimos al Dashboard
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al registrar usuario';
      setError(errorMsg);
    } finally {
      // Ocultamos el spinner de carga
      setLoading(false);
    }
  };

  return { register, loading, error, setError }; // Devolvemos setError por si se desea limpiar el error manualmente
};
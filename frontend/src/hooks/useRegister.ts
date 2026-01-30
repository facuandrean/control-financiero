import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import type { RegisterInput } from '../types/auth.types';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usamos el hook de React Router para navegar a la página deseada
  const navigate = useNavigate();

  const register = async (credentials: RegisterInput) => {
    // Mostramos el spinner de carga
    setLoading(true);
    setError(null);

    try {
      // Llamamos al endpoint de login del backend
      const response = await api.post('/auth/register', credentials);
      console.log('response', response);

      navigate('/login'); // Redirigimos al Login
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
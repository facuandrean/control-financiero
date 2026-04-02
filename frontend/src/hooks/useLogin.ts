import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import type { LoginInput } from '../types/auth.types';
import { useAuthStore } from '../store/authStore';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { setUser } = useAuthStore();

  const login = async (credentials: LoginInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', credentials);
      
      // Solo extraemos el usuario
      const { user } = response.data.data;
      setUser(user);

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, setError };
};
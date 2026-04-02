import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import type { RegisterInput } from '../types/auth.types';
import { useAuthStore } from '../store/authStore';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { setUser } = useAuthStore();

  const register = async (credentials: RegisterInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', credentials);

      if (response.status === 201) {
        // Al hacer login, el backend automáticamente enviará el Set-Cookie con el token
        const loginResponse = await api.post('/auth/login', {
          email: credentials.email,
          password: credentials.password
        });

        // Solo sacamos el usuario. El token ya está seguro en el navegador.
        const { user } = loginResponse.data.data;
        setUser(user);

        navigate('/'); // Redirigimos al Dashboard
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al registrar usuario';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, setError };
};
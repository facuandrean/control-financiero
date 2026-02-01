import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logout();
      navigate('/login');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cerrar sesión';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogout, loading, error, setError };
};

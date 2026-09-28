import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CredentialResponse } from '@react-oauth/google';
import { api } from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const useGoogleAuth = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const clearGoogleError = () => setGoogleError(null);

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setGoogleError('No se recibió la credencial de autenticación de Google.');
      return;
    }

    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      const { user } = response.data.data;
      setUser(user);
      navigate('/');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Error al iniciar sesión con Google';
      setGoogleError(errorMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const onGoogleError = () => {
    setGoogleError('No se pudo completar el inicio de sesión con Google. Intenta nuevamente.');
  };

  return {
    onGoogleSuccess,
    onGoogleError,
    googleLoading,
    googleError,
    setGoogleError,
    clearGoogleError,
  };
};

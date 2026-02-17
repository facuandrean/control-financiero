import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/accounts');
      console.log("response accounts", response);
      setAccounts(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener las cuentas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = async (data: { 
    name: string; 
    type: string; 
    balance?: number 
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/accounts', data);
      setSuccess('¡Cuenta creada correctamente!');
      await fetchAccounts(); // Refrescamos la lista automáticamente
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cuenta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    accounts, 
    fetchAccounts, 
    createAccount, 
    loading, 
    error, 
    setError, 
    success, 
    setSuccess 
  };
};
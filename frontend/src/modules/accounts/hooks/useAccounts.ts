import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';
import type { Account, CreateAccountInput } from '../../../types/account.types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/accounts');
      // Axios parsea el cuerpo en response.data. Tu backend responde con sendSuccess(res, data)
      console.log('fetchAccounts response:', response.data);
      setAccounts(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener las cuentas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = async (data: CreateAccountInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('data:', data);

      const payload: Record<string, any> = {
        bank: data.bank,
        name: data.name,
        type: data.type,
        tag: data.tag,
      };

      if (data.amount !== undefined && data.amount !== null) {
        payload.amount = Number(data.amount);
      }

      if (data.description) {
        payload.description = data.description;
      }

      if (data.type !== 'Efectivo' && data.lastDigits) {
        payload.lastDigits = data.lastDigits;
      }

      if (data.type === 'Tarjeta de Crédito') {
        if (data.creditLimit !== undefined && data.creditLimit !== null) {
          payload.creditLimit = Number(data.creditLimit);
        }

        if (data.closingDay !== undefined && data.closingDay !== null) {
          payload.closingDay = Number(data.closingDay);
        }

        if (data.dueDate !== undefined && data.dueDate !== null) {
          payload.dueDate = Number(data.dueDate);
        }
      }

      console.log('createAccount payload:', payload); 

      await api.post('/api/accounts', payload);
      setSuccess('¡Cuenta creada correctamente!');
      await fetchAccounts();
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
    clearError,
    success,
    clearSuccess,
  };
};
import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';
import type { Account, CreateAccountInput } from '../../../types/account.types';

const isValidNumber = (val: unknown): boolean =>
  val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(Number(val));

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

        if (isValidNumber(data.closingDay)) {
          payload.closingDay = Math.floor(Number(data.closingDay));
        }

        if (isValidNumber(data.dueDate)) {
          payload.dueDate = Math.floor(Number(data.dueDate));
        }
      }

      await api.post('/accounts', payload);
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

  const updateAccount = async (id: string, data: Partial<CreateAccountInput>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Record<string, any> = {};

      if (data.bank !== undefined) payload.bank = data.bank;
      if (data.name !== undefined) payload.name = data.name;
      if (data.type !== undefined) payload.type = data.type;
      if (data.tag !== undefined) payload.tag = data.tag;

      if (isValidNumber(data.amount)) {
        payload.amount = Number(data.amount);
      }

      if (data.description !== undefined) {
        payload.description = typeof data.description === 'string' && data.description.trim() ? data.description.trim() : null;
      }

      if (data.type && data.type !== 'Efectivo') {
        payload.lastDigits = typeof data.lastDigits === 'string' && data.lastDigits.trim() ? data.lastDigits.trim() : null;
      } else if (data.type === 'Efectivo') {
        payload.lastDigits = null;
      }

      if (data.type === 'Tarjeta de Crédito') {
        payload.creditLimit = isValidNumber(data.creditLimit) ? Number(data.creditLimit) : null;
        payload.closingDay = isValidNumber(data.closingDay) ? Math.floor(Number(data.closingDay)) : null;
        payload.dueDate = isValidNumber(data.dueDate) ? Math.floor(Number(data.dueDate)) : null;
      } else if (data.type && data.type !== 'Tarjeta de Crédito') {
        payload.creditLimit = null;
        payload.closingDay = null;
        payload.dueDate = null;
      }

      await api.patch(`/accounts/${id}`, payload);
      setSuccess('¡Cuenta actualizada correctamente!');
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la cuenta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateAccount = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/accounts/${id}`);
      setSuccess('¡Cuenta dada de baja correctamente!');
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al dar de baja la cuenta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactivateAccount = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/accounts/${id}`, { status: 'Active' });
      setSuccess('¡Cuenta reactivada correctamente!');
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reactivar la cuenta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    fetchAccounts,
    createAccount,
    updateAccount,
    deactivateAccount,
    reactivateAccount,
    loading,
    error,
    clearError,
    success,
    clearSuccess,
  };
};
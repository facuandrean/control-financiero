import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';
import { useClear } from '../../../hooks/useClear';
import type {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../../../types/transaction.types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  useClear({ message: error, clearMessage: clearError, time: 5000 });
  useClear({ message: success, clearMessage: clearSuccess, time: 4000 });

  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters?.month !== undefined) params.month = filters.month;
      if (filters?.year !== undefined) params.year = filters.year;
      if (filters?.accountID) params.accountID = filters.accountID;
      if (filters?.type) params.type = filters.type;

      const response = await api.get('/transactions', { params });
      const rawList: Transaction[] = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setTransactions(rawList);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTransactions([]);
      } else {
        setError(err.response?.data?.message || 'Error al cargar las transacciones');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = async (data: CreateTransactionDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/transactions', data);
      setSuccess('¡Transacción registrada correctamente!');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrar la transacción';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (
    id: string,
    data: UpdateTransactionDTO
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/transactions/${id}`, data);
      setSuccess('¡Transacción actualizada correctamente!');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al actualizar la transacción';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/transactions/${id}`);
      setSuccess('¡Transacción eliminada correctamente!');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar la transacción';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    success,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
    clearSuccess,
  };
};

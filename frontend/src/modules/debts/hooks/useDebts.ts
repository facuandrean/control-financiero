import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';
import type {
  Debt,
  CreateDebtDTO,
  UpdateDebtDTO,
  CreateDebtPaymentDTO,
} from '../../../types/debt.types';

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/debts');
      const rawList: Debt[] = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Normalizar para que paidAmount y totalPaid siempre existan
      const normalizedList = rawList.map((d) => {
        const paid = d.totalPaid ?? d.paidAmount ?? 0;
        return {
          ...d,
          totalPaid: paid,
          paidAmount: paid,
          remainingAmount: d.remainingAmount ?? Math.max(0, d.totalAmount - paid),
        };
      });

      setDebts(normalizedList);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setDebts([]);
      } else {
        setError(err.response?.data?.message || 'Error al cargar las deudas');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createDebt = async (data: CreateDebtDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/debts', data);
      setSuccess('¡Deuda creada correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la deuda');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDebt = async (id: string, data: UpdateDebtDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/debts/${id}`, data);
      setSuccess('¡Deuda actualizada correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la deuda');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDebt = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/debts/${id}`);
      setSuccess('¡Deuda eliminada correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar la deuda');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (
    debtId: string,
    amount: number,
    date?: string,
    notes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: CreateDebtPaymentDTO = {
        amount,
        date: date || new Date().toISOString(),
        notes: notes || null,
      };
      await api.post(`/debts/${debtId}/payments`, payload);
      setSuccess('¡Pago registrado correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el pago');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (paymentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/debts/payments/${paymentId}`);
      setSuccess('¡Pago eliminado correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el pago');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    debts,
    loading,
    error,
    success,
    fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    deletePayment,
    clearError,
    clearSuccess,
  };
};

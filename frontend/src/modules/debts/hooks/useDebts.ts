import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';
import type {
  Debt,
  DebtStatus,
  CreateDebtDTO,
  UpdateDebtDTO,
  CreateMovementDTO,
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

      // Normalizar para que balance, remainingAmount y movimientos siempre existan
      const normalizedList = rawList.map((d) => {
        const initialAmount = Number(d.initialAmount) || 0;
        const mvts = d.movements || [];
        const totalCharges =
          d.totalCharges ??
          mvts.filter((m) => m.type === 'CHARGE').reduce((sum, m) => sum + m.amount, 0);
        const totalPayments =
          d.totalPayments ??
          mvts.filter((m) => m.type === 'PAYMENT').reduce((sum, m) => sum + m.amount, 0);
        const balance =
          d.balance !== undefined
            ? Number(d.balance)
            : initialAmount + totalCharges - totalPayments;
        const remaining =
          d.remainingAmount !== undefined
            ? Number(d.remainingAmount)
            : Math.max(0, balance);
        const totalAmount =
          d.totalAmount !== undefined
            ? Number(d.totalAmount)
            : initialAmount + totalCharges;
        const status: DebtStatus = balance <= 0 ? 'Settled' : 'Pending';

        return {
          ...d,
          initialAmount,
          balance,
          totalCharges,
          totalPayments,
          remainingAmount: remaining,
          totalAmount,
          totalPaid: totalPayments,
          paidAmount: totalPayments,
          status,
          movements: mvts,
          payments: mvts.filter((m) => m.type === 'PAYMENT'),
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
      const payload = {
        entityID: data.entityID,
        type: data.type,
        initialAmount: Number(data.initialAmount ?? data.amount ?? 0),
      };
      await api.post('/debts', payload);
      setSuccess('¡Cuenta de deuda creada correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cuenta de deuda');
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

  const addMovement = async (
    debtId: string,
    data: CreateMovementDTO
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/debts/${debtId}/movements`, data);
      setSuccess(
        data.type === 'PAYMENT'
          ? '¡Pago registrado correctamente!'
          : '¡Cargo añadido correctamente!'
      );
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el movimiento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovement = async (movementId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/debts/movements/${movementId}`);
      setSuccess('¡Movimiento eliminado y saldo restaurado correctamente!');
      await fetchDebts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el movimiento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funciones de compatibilidad legada
  const addPayment = async (
    debtId: string,
    amount: number,
    accountID: string,
    date?: string,
    notes?: string
  ): Promise<boolean> => {
    return addMovement(debtId, {
      type: 'PAYMENT',
      amount,
      description: notes || 'Pago registrado',
      date: date || new Date().toISOString().split('T')[0],
      accountID: accountID || null,
    });
  };

  const deletePayment = async (paymentId: string): Promise<boolean> => {
    return deleteMovement(paymentId);
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
    addMovement,
    deleteMovement,
    addPayment,
    deletePayment,
    clearError,
    clearSuccess,
  };
};

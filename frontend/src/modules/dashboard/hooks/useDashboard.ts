import { useCallback, useState } from 'react';
import { api } from '../../../api/axios';
import type { DashboardSummary } from '../../../types/dashboard.types';

export const useDashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchSummary = useCallback(
    async (month?: string | number, year?: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {};
        if (month !== undefined) params.month = month;
        if (year !== undefined) params.year = year;

        const response = await api.get('/dashboard/summary', { params });
        const data: DashboardSummary = response.data?.data || response.data;
        setSummary(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Error al cargar el resumen financiero'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    summary,
    loading,
    error,
    clearError,
    fetchSummary,
  };
};

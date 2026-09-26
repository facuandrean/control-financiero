import { useCallback, useState } from "react";
import { api } from "../../../api/axios";
import type { Entity, CreateEntityDTO, UpdateEntityDTO } from "../../../types/entity.types";

export const useEntities = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/entities');
      setEntities(Array.isArray(response.data) ? response.data : (response.data.data || []));
    } catch (err: any) {
      if (err.response?.status === 404) {
        setEntities([]);
      } else {
        setError(err.response?.data?.message || 'Error al cargar las entidades');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntity = async (data: CreateEntityDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/entities', data);
      setSuccess('¡Entidad creada correctamente!');
      await fetchEntities();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la entidad');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEntity = async (id: string, data: UpdateEntityDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/entities/${id}`, data);
      setSuccess('¡Entidad actualizada correctamente!');
      await fetchEntities();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la entidad');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateEntity = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/entities/${id}`);
      setSuccess('¡Entidad dada de baja correctamente!');
      await fetchEntities();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al dar de baja la entidad');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactivateEntity = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/entities/${id}`, { status: 'Active' });
      setSuccess('¡Entidad reactivada correctamente!');
      await fetchEntities();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reactivar la entidad');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    entities,
    loading,
    error,
    success,
    fetchEntities,
    createEntity,
    updateEntity,
    deactivateEntity,
    reactivateEntity,
    clearError,
    clearSuccess,
  };
};

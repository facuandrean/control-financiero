import { useCallback, useState } from "react";
import { api } from "../../../api/axios";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../../../types/category.types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      // Asegurarnos de que response.data sea un array, dependiendo de la respuesta del backend
      setCategories(Array.isArray(response.data) ? response.data : (response.data.data || []));
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCategories([]);
      } else {
        setError(err.response?.data?.message || 'Error al cargar las categorías');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (data: CreateCategoryInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/categories', data);
      setSuccess('¡Categoría creada correctamente!');
      await fetchCategories();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/categories/${id}`, data);
      setSuccess('¡Categoría actualizada correctamente!');
      await fetchCategories();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateCategory = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/categories/${id}`);
      setSuccess('¡Categoría dada de baja correctamente!');
      await fetchCategories();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al dar de baja la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactivateCategory = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/categories/${id}`, { status: 'Active' });
      setSuccess('¡Categoría reactivada correctamente!');
      await fetchCategories();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reactivar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    success,
    fetchCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
    reactivateCategory,
    clearError,
    clearSuccess
  };
};

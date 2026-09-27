import { useEffect } from 'react';
import { Form, Input, Select } from '../../../components/ui';
import { useEntities } from '../../entities';

interface DebtFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  defaultValues?: any;
  modalId: string;
  formId: string;
}

export const DebtForm = ({
  onSubmit,
  loading,
  errorMessage,
  successMessage,
  clearError,
  clearSuccess,
  defaultValues,
  modalId,
  formId,
}: DebtFormProps) => {
  const { entities, fetchEntities } = useEntities();

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const entityOptions = entities
    .filter((e) => e.status === 'Active' || e.id === defaultValues?.entityID)
    .map((e) => ({
      value: e.id || '',
      label: e.name,
    }));

  const typeOptions = [
    { value: 'Payable', label: 'Debo (Tengo que pagar)' },
    { value: 'Receivable', label: 'Me deben (Tengo que cobrar)' },
  ];

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      totalAmount: Number(data.totalAmount),
      dueDate: data.dueDate || null,
    });
  };

  return (
    <Form
      formId={formId}
      onSubmit={handleFormSubmit}
      loading={loading}
      errorMessage={errorMessage || undefined}
      successMessage={successMessage || undefined}
      clearError={clearError}
      clearSuccess={clearSuccess}
      modalId={modalId}
      defaultValues={
        defaultValues || {
          entityID: '',
          type: 'Payable',
          description: '',
          totalAmount: '',
          dueDate: '',
        }
      }
    >
      {({ control, errors }) => (
        <>
          <Select
            formID={formId}
            name="entityID"
            label="Entidad / Persona"
            placeholder="Selecciona una entidad..."
            control={control}
            rules={{ required: 'Debes seleccionar una entidad' }}
            errors={errors}
            options={entityOptions}
          />

          <Select
            formID={formId}
            name="type"
            label="Tipo de Deuda"
            placeholder="Selecciona el tipo..."
            control={control}
            rules={{ required: 'Debes seleccionar el tipo de deuda' }}
            errors={errors}
            options={typeOptions}
          />

          <Input
            formID={formId}
            name="totalAmount"
            label="Monto Total"
            placeholder="Ej: 50000"
            type="number"
            control={control}
            rules={{
              required: 'El monto total es obligatorio',
              min: { value: 1, message: 'El monto debe ser mayor a 0' },
            }}
            errors={errors}
          />

          <Input
            formID={formId}
            name="description"
            label="Descripción o Motivo"
            placeholder="Ej: Préstamo personal, Arreglo del auto, Buzo comprado..."
            type="text"
            control={control}
            rules={{
              required: 'La descripción es obligatoria',
              minLength: { value: 3, message: 'Debe tener al menos 3 caracteres' },
            }}
            errors={errors}
          />

          <Input
            formID={formId}
            name="dueDate"
            label="Fecha de Vencimiento (Opcional)"
            placeholder=""
            type="date"
            control={control}
            errors={errors}
          />
        </>
      )}
    </Form>
  );
};

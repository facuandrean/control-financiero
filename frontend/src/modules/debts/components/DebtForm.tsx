import { useEffect } from 'react';
import { Form, Input, Select, MessageInfo } from '../../../components/ui';
import { useEntities } from '../../entities';
import { useAccounts } from '../../accounts';
import type { Debt } from '../../../types/debt.types';

interface DebtFormProps {
  debts?: Debt[];
  onSubmit: (data: any, existingDebtId?: string) => Promise<void>;
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
  debts = [],
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
  const { accounts, fetchAccounts } = useAccounts();

  useEffect(() => {
    fetchEntities();
    fetchAccounts();
  }, [fetchEntities, fetchAccounts]);

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const accountOptions = accounts
    .filter((a) => a.status === 'Active')
    .map((a) => ({
      value: a.id,
      label: `${a.bank} - ${a.name} (${formatCurrency(a.amount ?? 0)})`,
    }));

  const today = new Date().toISOString().split('T')[0];

  const handleFormSubmit = async (data: any) => {
    // Verificar si existe una deuda abierta para esta entidad
    const existingDebt = debts.find(
      (d) => d.entityID === data.entityID && d.status !== 'Settled'
    );

    await onSubmit(
      {
        entityID: data.entityID,
        type: data.type,
        amount: Number(data.amount || data.totalAmount || 0),
        initialAmount: Number(data.amount || data.totalAmount || 0),
        description: data.description || 'Cargo inicial',
        date: data.date || today,
        accountID: data.accountID ? data.accountID : null,
      },
      existingDebt?.id
    );
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
          amount: '',
          description: '',
          date: today,
          accountID: '',
        }
      }
    >
      {({ control, errors, watch }) => {
        const selectedEntityID = watch('entityID');
        const existingDebt = debts.find(
          (d) => d.entityID === selectedEntityID && d.status !== 'Settled'
        );

        return (
          <>
            {existingDebt && (
              <MessageInfo
                message="Ya existe una cuenta con esta persona. Este registro se añadirá como un nuevo cargo a su libreta"
                className="mb-3"
              />
            )}

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
              name="amount"
              label={
                existingDebt
                  ? 'Monto del Cargo'
                  : 'Monto Inicial de la Deuda'
              }
              placeholder="Ej: 50000"
              type="number"
              control={control}
              rules={{
                required: 'El monto es obligatorio',
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
              name="date"
              label="Fecha"
              type="date"
              control={control}
              rules={{ required: 'La fecha es obligatoria' }}
              errors={errors}
            />

            <Select
              formID={formId}
              name="accountID"
              label="Cuenta bancaria vinculada (Opcional)"
              placeholder="Ninguna (no afectar cuenta bancaria)"
              control={control}
              errors={errors}
              options={accountOptions}
            />
          </>
        );
      }}
    </Form>
  );
};

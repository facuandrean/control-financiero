import { useEffect } from 'react';
import { Form, Input, Select } from '../../../components/ui';
import { useAccounts } from '../../accounts';
import { getLocalDateString } from '../../../utils/date.utils';
import type { Debt, CreateMovementDTO } from '../../../types/debt.types';

interface MovementFormProps {
  debt: Debt | null;
  type: 'CHARGE' | 'PAYMENT';
  onSubmit: (data: CreateMovementDTO) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  modalId: string;
  formId: string;
}

export const MovementForm = ({
  debt,
  type,
  onSubmit,
  loading,
  errorMessage,
  successMessage,
  clearError,
  clearSuccess,
  modalId,
  formId,
}: MovementFormProps) => {
  const { accounts, fetchAccounts } = useAccounts();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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

  const today = getLocalDateString();

  const handleFormSubmit = async (data: any) => {
    const payload: CreateMovementDTO = {
      type: type,
      amount: Number(data.amount),
      description: data.description,
      date: data.date || today,
      accountID: data.accountID ? data.accountID : null,
    };
    await onSubmit(payload);
  };

  const getAccountLabel = () => {
    if (!debt) return 'Cuenta bancaria vinculada (Opcional)';
    if (type === 'CHARGE') {
      return debt.type === 'Payable'
        ? 'Cuenta donde ingresó el dinero prestado (Opcional)'
        : 'Cuenta desde donde prestaste el dinero (Opcional)';
    } else {
      return debt.type === 'Payable'
        ? 'Cuenta de origen del pago (Opcional)'
        : 'Cuenta de destino del cobro (Opcional)';
    }
  };

  const balance = debt?.balance ?? (debt?.initialAmount ?? 0);

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
      defaultValues={{
        amount: '',
        description: '',
        date: today,
        accountID: '',
      }}
    >
      {({ control, errors }) => (
        <>
          {debt && (
            <div
              className="mb-3 p-3 rounded"
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
              }}
            >
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Entidad / Persona:</span>
                <strong className="text-dark">{debt.entity?.name || 'Entidad'}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Operación:</span>
                <span
                  className="fw-bold"
                  style={{
                    color: type === 'CHARGE' ? '#c46262' : '#4c9767',
                  }}
                >
                  {type === 'CHARGE'
                    ? 'Añadir cargo'
                    : 'Registrar pago'}
                </span>
              </div>
              <div className="d-flex justify-content-between pt-1 border-top">
                <span className="fw-semibold">Saldo Pendiente Actual:</span>
                <strong>
                  {formatCurrency(Math.max(0, balance))}
                </strong>
              </div>
            </div>
          )}

          <Input
            formID={formId}
            name="amount"
            label={type === 'CHARGE' ? 'Monto del Cargo' : 'Monto del Pago'}
            placeholder="Ej: 15000"
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
            placeholder={
              type === 'CHARGE'
                ? 'Ej: Compra de repuesto, cena, flete...'
                : 'Ej: Transferencia bancaria, efectivo, abono...'
            }
            type="text"
            control={control}
            rules={{
              required: 'La descripción es obligatoria',
              minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
            }}
            errors={errors}
          />

          <Input
            formID={formId}
            name="date"
            label="Fecha del Movimiento"
            type="date"
            control={control}
            rules={{ required: 'La fecha es obligatoria' }}
            errors={errors}
          />

          <Select
            formID={formId}
            name="accountID"
            label={getAccountLabel()}
            placeholder="Ninguna (no registrar transacción bancaria)"
            control={control}
            errors={errors}
            options={accountOptions}
          />

          <p
            className="text-muted mt-1 mb-0"
            style={{ fontSize: '0.78rem' }}
          >
            💡 Si seleccionás una cuenta bancaria, se creará automáticamente la
            transacción y se sincronizará su saldo.
          </p>
        </>
      )}
    </Form>
  );
};

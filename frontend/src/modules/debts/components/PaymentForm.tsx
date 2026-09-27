import { Form, Input, Textarea } from '../../../components/ui';
import type { Debt } from '../../../types/debt.types';

interface PaymentFormProps {
  debt: Debt | null;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  modalId: string;
  formId: string;
}

export const PaymentForm = ({
  debt,
  onSubmit,
  loading,
  errorMessage,
  successMessage,
  clearError,
  clearSuccess,
  modalId,
  formId,
}: PaymentFormProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const remaining = debt
    ? debt.remainingAmount ?? Math.max(0, debt.totalAmount - (debt.paidAmount ?? 0))
    : 0;

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      amount: Number(data.amount),
      date: data.date || new Date().toISOString(),
      notes: data.notes || '',
    });
  };

  const today = new Date().toISOString().split('T')[0];

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
        amount: remaining > 0 ? remaining : '',
        date: today,
        notes: '',
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
                <span className="text-muted">Total de la Deuda:</span>
                <span>{formatCurrency(debt.totalAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Ya Pagado:</span>
                <span className="text-success">
                  {formatCurrency(debt.paidAmount ?? debt.totalPaid ?? 0)}
                </span>
              </div>
              <div className="d-flex justify-content-between pt-1 border-top">
                <span className="fw-semibold">Saldo Restante:</span>
                <strong className="text-danger">{formatCurrency(remaining)}</strong>
              </div>
            </div>
          )}

          <Input
            formID={formId}
            name="amount"
            label="Monto a pagar"
            placeholder="Ej: 10000"
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
            name="date"
            label="Fecha del Pago"
            type="date"
            control={control}
            rules={{ required: 'La fecha es obligatoria' }}
            errors={errors}
          />

          <Textarea
            formID={formId}
            name="notes"
            label="Notas / Comprobante (Opcional)"
            placeholder="Ej: Transferencia bancaria comprobante #12345..."
            control={control}
            errors={errors}
            rows={2}
          />
        </>
      )}
    </Form>
  );
};

import { useEffect, useState } from 'react';
import { Form, Input, Select } from '../../../components/ui';
import { useAccounts } from '../../accounts';
import { useCategories } from '../../categories';
import { useEntities } from '../../entities';
import type {
  CreateTransactionDTO,
  TransactionType,
} from '../../../types/transaction.types';
import './transactionForm.css';

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionDTO) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  defaultValues?: any;
  modalId: string;
  formId: string;
}

export const TransactionForm = ({
  onSubmit,
  loading,
  errorMessage,
  successMessage,
  clearError,
  clearSuccess,
  defaultValues,
  modalId,
  formId,
}: TransactionFormProps) => {
  const [currentType, setCurrentType] = useState<TransactionType>(
    defaultValues?.type || 'Expense'
  );

  const { accounts, fetchAccounts } = useAccounts();
  const { categories, fetchCategories } = useCategories();
  const { entities, fetchEntities } = useEntities();

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
    fetchEntities();
  }, [fetchAccounts, fetchCategories, fetchEntities]);

  const today = new Date().toISOString().split('T')[0];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const accountOptions = accounts
    .filter((a) => a.status === 'Active' || a.id === defaultValues?.accountID)
    .map((a) => ({
      value: a.id,
      label: `${a.bank} - ${a.name} (${formatCurrency(a.amount ?? 0)})`,
    }));

  const categoryOptions = categories
    .filter((c) => c.status === 'Active' || c.id === defaultValues?.categoryID)
    .map((c) => ({
      value: c.id || '',
      label: c.name,
    }));

  const entityOptions = entities
    .filter((e) => e.status === 'Active' || e.id === defaultValues?.entityID)
    .map((e) => ({
      value: e.id || '',
      label: e.name,
    }));

  const handleTabChange = (newType: TransactionType) => {
    setCurrentType(newType);
    clearError();
    clearSuccess();
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      type: currentType,
      amount: Number(data.amount),
      accountID: data.accountID,
      toAccountID: currentType === 'Transfer' ? data.toAccountID : null,
      categoryID: currentType === 'Transfer' ? null : data.categoryID || null,
      entityID: currentType === 'Transfer' ? null : data.entityID || null,
      date: data.date,
      description: data.description,
    });
  };

  return (
    <div>
      {/* Pestañas de tipo */}
      <div className="transaction-tabs-nav">
        <button
          type="button"
          className={`transaction-tab-btn tab-expense ${
            currentType === 'Expense' ? 'active' : ''
          }`}
          onClick={() => handleTabChange('Expense')}
        >
          Egreso
        </button>
        <button
          type="button"
          className={`transaction-tab-btn tab-income ${
            currentType === 'Income' ? 'active' : ''
          }`}
          onClick={() => handleTabChange('Income')}
        >
          Ingreso
        </button>
        <button
          type="button"
          className={`transaction-tab-btn tab-transfer ${
            currentType === 'Transfer' ? 'active' : ''
          }`}
          onClick={() => handleTabChange('Transfer')}
        >
          Transferencia
        </button>
      </div>

      <Form
        key={`${formId}-${currentType}`}
        formId={formId}
        onSubmit={handleFormSubmit}
        loading={loading}
        errorMessage={errorMessage || undefined}
        successMessage={successMessage || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        modalId={modalId}
        defaultValues={{
          accountID: defaultValues?.accountID || '',
          toAccountID: defaultValues?.toAccountID || '',
          categoryID: defaultValues?.categoryID || '',
          entityID: defaultValues?.entityID || '',
          amount: defaultValues?.amount || '',
          date: defaultValues?.date ? defaultValues.date.split('T')[0] : today,
          description: defaultValues?.description || '',
        }}
      >
        {({ control, errors }) => (
          <>
            {/* Cuenta Origen */}
            <Select
              formID={formId}
              name="accountID"
              label={currentType === 'Transfer' ? 'Cuenta Origen' : 'Cuenta'}
              placeholder="Seleccionar cuenta..."
              control={control}
              rules={{ required: 'Debes seleccionar una cuenta' }}
              errors={errors}
              options={accountOptions}
            />

            {/* Cuenta Destino (solo para Transferencias) */}
            {currentType === 'Transfer' && (
              <Select
                formID={formId}
                name="toAccountID"
                label="Cuenta Destino"
                placeholder="Seleccionar cuenta de destino..."
                control={control}
                rules={{ required: 'Debes seleccionar la cuenta destino' }}
                errors={errors}
                options={accountOptions}
              />
            )}

            {/* Monto */}
            <Input
              formID={formId}
              name="amount"
              label="Monto"
              placeholder="Ej: 5000"
              type="number"
              control={control}
              rules={{
                required: 'El monto es obligatorio',
                min: { value: 1, message: 'El monto debe ser mayor a 0' },
              }}
              errors={errors}
            />

            {/* Fecha */}
            <Input
              formID={formId}
              name="date"
              label="Fecha"
              type="date"
              control={control}
              rules={{ required: 'La fecha es obligatoria' }}
              errors={errors}
            />

            {/* Categoría (solo para Ingresos y Egresos) */}
            {currentType !== 'Transfer' && (
              <Select
                formID={formId}
                name="categoryID"
                label="Categoría (Opcional)"
                placeholder="Seleccionar categoría..."
                control={control}
                errors={errors}
                options={categoryOptions}
              />
            )}

            {/* Entidad (solo para Ingresos y Egresos) */}
            {currentType !== 'Transfer' && (
              <Select
                formID={formId}
                name="entityID"
                label="Entidad / Comercio (Opcional)"
                placeholder="Seleccionar entidad..."
                control={control}
                errors={errors}
                options={entityOptions}
              />
            )}

            {/* Descripción */}
            <Input
              formID={formId}
              name="description"
              label="Descripción"
              placeholder="Ej: Compra supermercado, Pago sueldo, etc."
              type="text"
              control={control}
              rules={{
                required: 'La descripción es obligatoria',
                minLength: {
                  value: 3,
                  message: 'Debe tener al menos 3 caracteres',
                },
              }}
              errors={errors}
            />
          </>
        )}
      </Form>
    </div>
  );
};

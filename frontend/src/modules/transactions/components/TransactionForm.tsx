import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Form, Input, Select } from '../../../components/ui';
import { useAccounts } from '../../accounts';
import { useCategories } from '../../categories';
import { useEntities } from '../../entities';
import { getLocalDateString } from '../../../utils/date.utils';
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
  creditCardMode?: boolean;
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
  creditCardMode = false,
}: TransactionFormProps) => {
  const [currentType, setCurrentType] = useState<TransactionType>(
    creditCardMode ? 'Expense' : defaultValues?.type || 'Expense'
  );

  const { accounts, fetchAccounts } = useAccounts();
  const { categories, fetchCategories } = useCategories();
  const { entities, fetchEntities } = useEntities();

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
    fetchEntities();
  }, [fetchAccounts, fetchCategories, fetchEntities]);

  useEffect(() => {
    if (creditCardMode) {
      setCurrentType('Expense');
    }
  }, [creditCardMode]);

  const today = getLocalDateString();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const isAccountCreditCard = (accId?: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return Boolean(
      acc &&
      (acc.type === 'Credit Card' ||
        acc.type === 'Tarjeta de Crédito' ||
        acc.tag === 'crédito' ||
        acc.tag === 'T. Créd.' ||
        acc.type?.toLowerCase().includes('crédit') ||
        acc.type?.toLowerCase().includes('credit'))
    );
  };

  const accountOptions = accounts
    .filter((a) => a.status === 'Active' || a.id === defaultValues?.accountID)
    .filter((a) => {
      if (!creditCardMode) return true;
      return isAccountCreditCard(a.id);
    })
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
    if (creditCardMode) return;
    setCurrentType(newType);
    clearError();
    clearSuccess();
  };

  const handleFormSubmit = async (data: any) => {
    const isCreditCard = creditCardMode || isAccountCreditCard(data.accountID);

    await onSubmit({
      type: currentType,
      amount: Number(data.amount),
      accountID: data.accountID,
      toAccountID: currentType === 'Transfer' ? data.toAccountID : null,
      categoryID: currentType === 'Transfer' ? null : data.categoryID || null,
      entityID: currentType === 'Transfer' ? null : data.entityID || null,
      date: data.date,
      description: data.description,
      installments:
        currentType === 'Expense' && isCreditCard && data.installments
          ? Number(data.installments)
          : 1,
    });
  };

  return (
    <div>
      {/* Pestañas de tipo */}
      {!creditCardMode ? (
        <div className="transaction-tabs-nav">
          <button
            type="button"
            className={`transaction-tab-btn tab-expense ${currentType === 'Expense' ? 'active' : ''
              }`}
            onClick={() => handleTabChange('Expense')}
          >
            Egreso
          </button>
          <button
            type="button"
            className={`transaction-tab-btn tab-income ${currentType === 'Income' ? 'active' : ''
              }`}
            onClick={() => handleTabChange('Income')}
          >
            Ingreso
          </button>
          <button
            type="button"
            className={`transaction-tab-btn tab-transfer ${currentType === 'Transfer' ? 'active' : ''
              }`}
            onClick={() => handleTabChange('Transfer')}
          >
            Transferencia
          </button>
        </div>
      ) : (
        <div className="transaction-tabs-nav">
          <button
            type="button"
            className="transaction-tab-btn tab-expense active"
            style={{ width: '100%', cursor: 'default' }}
            disabled
          >
            Egreso
          </button>
        </div>
      )}

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
          installments: defaultValues?.installments || 1,
          date: defaultValues?.date ? defaultValues.date.split('T')[0] : today,
          description: defaultValues?.description || '',
        }}
      >
        {({ control, errors }) => {
          const selectedAccountID = useWatch({ control, name: 'accountID' });
          const isCreditCard = isAccountCreditCard(selectedAccountID);

          return (
            <>
              {/* Cuenta Origen */}
              <Select
                formID={formId}
                name="accountID"
                label={currentType === 'Transfer' ? 'Cuenta Origen' : creditCardMode ? 'Tarjeta de Crédito' : 'Cuenta'}
                placeholder={creditCardMode ? 'Seleccionar tarjeta...' : 'Seleccionar cuenta...'}
                control={control}
                rules={{ required: creditCardMode ? 'Debes seleccionar una tarjeta' : 'Debes seleccionar una cuenta' }}
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

              {/* Cantidad de Cuotas (visible desde el primer momento en modo tarjeta o si la cuenta seleccionada es TC) */}
              {(creditCardMode || (currentType === 'Expense' && isCreditCard)) && (
                <Input
                  formID={formId}
                  name="installments"
                  label="Cantidad de Cuotas"
                  placeholder="1"
                  type="number"
                  control={control}
                  rules={{
                    min: { value: 1, message: 'Mínimo 1 cuota' },
                    max: { value: 72, message: 'Máximo 72 cuotas' },
                  }}
                  errors={errors}
                />
              )}

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
          );
        }}
      </Form>
    </div>
  );
};

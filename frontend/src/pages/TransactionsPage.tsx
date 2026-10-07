import { useCallback, useEffect, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { ModalConfirm } from '../components/layout/modal/ModalConfirm';
import { Loading } from '../components/ui';
import { useIsMobile } from '../hooks';
import {
  TransactionMetrics,
  TransactionList,
  TransactionForm,
  ModalTransactionDetails,
  useTransactions,
} from '../modules/transactions';
import { useAccounts } from '../modules/accounts';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import type {
  Transaction,
  CreateTransactionDTO,
} from '../types/transaction.types';

import './transactionsPage.css';

interface TransactionsPageProps {
  section: string;
}

const MONTHS = [
  { value: 'all', label: 'Todos los meses' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const YEARS = ['2024', '2025', '2026', '2027'];

export const TransactionsPage = ({ section }: TransactionsPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const {
    transactions,
    loading,
    error,
    success,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    clearError,
    clearSuccess,
  } = useTransactions();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (now.getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    now.getFullYear().toString()
  );
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] =
    useState<Transaction | null>(null);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  const { fetchAccounts } = useAccounts();

  const loadData = useCallback(async () => {
    await fetchAccounts();
    return fetchTransactions({
      month: selectedMonth === 'all' ? undefined : selectedMonth,
      year: selectedYear ? selectedYear : undefined,
    });
  }, [fetchAccounts, fetchTransactions, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrado en memoria por tipo y búsqueda
  const filteredTransactions = transactions.filter((t) => {
    if (activeTypeFilter !== 'all' && t.type !== activeTypeFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const entityMatch = t.entity?.name?.toLowerCase().includes(term);
      const categoryMatch = t.category?.name?.toLowerCase().includes(term);
      const accountMatch = t.account?.name?.toLowerCase().includes(term);
      const toAccountMatch = t.toAccount?.name?.toLowerCase().includes(term);
      const descMatch = t.description?.toLowerCase().includes(term);

      return (
        entityMatch ||
        categoryMatch ||
        accountMatch ||
        toAccountMatch ||
        descMatch
      );
    }

    return true;
  });

  const handleCreateSubmit = async (formData: CreateTransactionDTO) => {
    const isOk = await createTransaction(formData);
    if (isOk) {
      setIsSuccessClosing(true);
      await loadData();
      setTimeout(() => {
        closeModal({ idModal: 'transaction-create-modal' });
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction?.id) return;
    const isOk = await deleteTransaction(selectedTransaction.id);
    if (isOk) {
      setIsSuccessClosing(true);
      await loadData();
      setTimeout(() => {
        closeModal({ idModal: 'transaction-delete-modal' });
        setSelectedTransaction(null);
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  return (
    <MainLayout
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || ''}
    >
      <BodyHeader
        title="Transacciones"
        description="Registra y visualiza tus ingresos, egresos y transferencias entre cuentas."
        isMobile={isMobile}
        button={{
          label: 'Nueva transacción',
          labelLoading: 'Agregando...',
          className: 'btn-add-transaction',
          onClick: () => {
            clearError();
            clearSuccess();
            openModal({ idModal: 'transaction-create-modal' });
          },
          visible: true,
        }}
      />

      <div className="transactions-page-container">
        {/* FILTROS Y SELECTORES DE FECHA */}
        <BodyContent className="transactions-controls-box">
          <div className="transactions-date-selector-row">
            <div className="transactions-date-pickers">
              <select
                className="transactions-select-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Seleccionar Mes"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="transactions-select-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                aria-label="Seleccionar Año"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Buscar por entidad, categoría o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="transactions-search-input"
            />
          </div>

          <div className="transactions-type-pills">
            <button
              type="button"
              className={`btn-tx-filter-tag ${activeTypeFilter === 'all' ? 'active' : ''
                }`}
              onClick={() => setActiveTypeFilter('all')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`btn-tx-filter-tag ${activeTypeFilter === 'Income' ? 'active' : ''
                }`}
              onClick={() => setActiveTypeFilter('Income')}
            >
              Ingresos
            </button>
            <button
              type="button"
              className={`btn-tx-filter-tag ${activeTypeFilter === 'Expense' ? 'active' : ''
                }`}
              onClick={() => setActiveTypeFilter('Expense')}
            >
              Egresos
            </button>
            <button
              type="button"
              className={`btn-tx-filter-tag ${activeTypeFilter === 'Transfer' ? 'active' : ''
                }`}
              onClick={() => setActiveTypeFilter('Transfer')}
            >
              Transf.
            </button>
          </div>
        </BodyContent>

        {/* MÉTRICAS FINANCIERAS */}
        <TransactionMetrics transactions={filteredTransactions} />

        {/* LISTA AGRUPADA DE TRANSACCIONES */}
        <BodyContent className="transactions-list-container">
          {loading && transactions.length === 0 ? (
            <div className="transactions-loading-state">
              <Loading />
            </div>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onDelete={(tx) => {
                setSelectedTransaction(tx);
                clearError();
                clearSuccess();
                openModal({ idModal: 'transaction-delete-modal' });
              }}
              onViewDetails={(tx) => {
                setDetailTransaction(tx);
                openModal({ idModal: 'transaction-details-modal' });
              }}
            />
          )}
        </BodyContent>
      </div>

      {/* MODAL CREAR TRANSACCIÓN */}
      <ModalPost
        title="Nueva Transacción"
        id="transaction-create-modal"
        formId="transaction-create-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
      >
        <TransactionForm
          onSubmit={handleCreateSubmit}
          loading={loading}
          errorMessage={error}
          successMessage={success}
          clearError={clearError}
          clearSuccess={clearSuccess}
          modalId="transaction-create-modal"
          formId="transaction-create-form"
        />
      </ModalPost>


      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      <ModalConfirm
        id="transaction-delete-modal"
        title="Eliminar Transacción"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error || undefined}
        successMessage={success || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedTransaction(null)}
        buttonLabel="Eliminar"
        buttonLabelLoading="Eliminando..."
        confirmButtonClass="btn btn-danger"
        onConfirm={handleDeleteConfirm}
      >
        {selectedTransaction && (
          <>
            <p>
              ¿Estás seguro de que querés eliminar esta transacción de{' '}
              <strong>
                ${new Intl.NumberFormat('es-AR').format(selectedTransaction.amount)}
              </strong>
              ?
            </p>
            <p
              className="text-muted mb-0 mt-1 d-flex align-items-center gap-3"
              style={{ fontSize: '0.9rem' }}
            >
              <BsInfoCircle size={16} />
              Esta acción revertirá automáticamente el saldo de las cuentas involucradas.
            </p>
          </>
        )}
      </ModalConfirm>

      {/* MODAL DETALLES DE TRANSACCIÓN */}
      <ModalTransactionDetails
        id="transaction-details-modal"
        transaction={detailTransaction}
        onClose={() => setDetailTransaction(null)}
        onDelete={(tx) => {
          setSelectedTransaction(tx as Transaction);
          clearError();
          clearSuccess();
          openModal({ idModal: 'transaction-delete-modal' });
        }}
      />
    </MainLayout>
  );
};
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BsArrowDownLeft,
  BsArrowUpRight,
  BsArrowLeftRight,
  BsReceiptCutoff,
  BsChevronLeft,
  BsChevronRight,
  BsWallet2,
  BsPiggyBank,
  BsPieChart,
  BsClockHistory,
  BsArrowRightShort,
} from 'react-icons/bs';

import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { BodyHeader, BodyContent } from '../components/layout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { Loading } from '../components/ui';
import { useIsMobile } from '../hooks';
import { useAuthStore } from '../store';
import { openModal, closeModal } from '../utils/modal.utils';

import { useDashboard } from '../modules/dashboard';
import { TransactionForm, useTransactions } from '../modules/transactions';
import { DebtForm, useDebts } from '../modules/debts';
import type {
  CreateTransactionDTO,
  TransactionType,
} from '../types/transaction.types';

import './dashboardPage.css';

interface DashboardPageProps {
  section: string;
}

const CATEGORY_COLORS = [
  '#ef4444',
  '#f97316',
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
];

export const DashboardPage = ({ section }: DashboardPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (now.getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    now.getFullYear().toString()
  );

  const { summary, loading: summaryLoading, fetchSummary } = useDashboard();

  // Transactions module integration
  const {
    loading: txLoading,
    error: txError,
    success: txSuccess,
    createTransaction,
    clearError: clearTxError,
    clearSuccess: clearTxSuccess,
  } = useTransactions();

  // Debts module integration
  const {
    debts,
    loading: debtLoading,
    error: debtError,
    success: debtSuccess,
    createDebt,
    addMovement,
    clearError: clearDebtError,
    clearSuccess: clearDebtSuccess,
  } = useDebts();

  const [modalTxType, setModalTxType] = useState<TransactionType>('Income');
  const [isTxSuccessClosing, setIsTxSuccessClosing] = useState(false);
  const [isDebtSuccessClosing, setIsDebtSuccessClosing] = useState(false);

  const loadData = useCallback(() => {
    fetchSummary(selectedMonth, selectedYear);
  }, [fetchSummary, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Currency & Date formatters
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    let m = Number(selectedMonth) - 1;
    let y = Number(selectedYear);
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedMonth(m.toString());
    setSelectedYear(y.toString());
  };

  const handleNextMonth = () => {
    let m = Number(selectedMonth) + 1;
    let y = Number(selectedYear);
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedMonth(m.toString());
    setSelectedYear(y.toString());
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [yearStr, monthStr] = e.target.value.split('-');
    setSelectedYear(yearStr);
    setSelectedMonth(Number(monthStr).toString());
  };

  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
  };

  const isCurrentMonth =
    Number(selectedMonth) === now.getMonth() + 1 &&
    Number(selectedYear) === now.getFullYear();

  // Quick action modal openers
  const handleOpenTxModal = (type: TransactionType) => {
    setModalTxType(type);
    clearTxError();
    clearTxSuccess();
    openModal({ idModal: 'dashboard-transaction-modal' });
  };

  const handleOpenDebtModal = () => {
    clearDebtError();
    clearDebtSuccess();
    openModal({ idModal: 'dashboard-debt-modal' });
  };

  // Submission handlers with 3-second auto-close and real-time dashboard refresh
  const handleTransactionSubmit = async (formData: CreateTransactionDTO) => {
    const isOk = await createTransaction(formData);
    if (isOk) {
      setIsTxSuccessClosing(true);
      await fetchSummary(selectedMonth, selectedYear);
      setTimeout(() => {
        closeModal({ idModal: 'dashboard-transaction-modal' });
        setIsTxSuccessClosing(false);
      }, 3000);
    }
  };

  const handleDebtSubmit = async (formData: any, existingDebtId?: string) => {
    let isOk = false;
    if (existingDebtId) {
      isOk = await addMovement(existingDebtId, {
        type: 'CHARGE',
        amount: formData.amount,
        description: formData.description || 'Nuevo cargo',
        date: formData.date,
        accountID: formData.accountID || null,
      });
    } else {
      isOk = await createDebt({
        entityID: formData.entityID,
        type: formData.type,
        initialAmount: formData.amount,
        description: formData.description,
      });
    }

    if (isOk) {
      setIsDebtSuccessClosing(true);
      await fetchSummary(selectedMonth, selectedYear);
      setTimeout(() => {
        closeModal({ idModal: 'dashboard-debt-modal' });
        setIsDebtSuccessClosing(false);
      }, 3000);
    }
  };

  const txModalTitle =
    modalTxType === 'Income'
      ? 'Nuevo Ingreso'
      : modalTxType === 'Expense'
        ? 'Nuevo Egreso'
        : 'Nueva Transferencia';

  const monthlyBalance = summary?.monthlyBalance ?? 0;

  return (
    <MainLayout
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || ''}
    >
      <BodyHeader
        title={`¡Hola, ${user?.name || 'Usuario'}!`}
        description="Resumen financiero mensual y panel de operaciones rápidas."
        isMobile={isMobile}
        button={{
          label: '',
          labelLoading: '',
          className: '',
          onClick: () => { },
          visible: false,
        }}
      />

      <div className="dashboard-page-container">
        {/* A. ATAJOS RÁPIDOS */}
        <div className="dashboard-quick-actions">
          <button
            type="button"
            className="quick-action-btn quick-action-income"
            onClick={() => handleOpenTxModal('Income')}
            aria-label="Registrar Nuevo Ingreso"
          >
            <div className="quick-action-icon-wrapper">
              <BsArrowDownLeft />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Nuevo Ingreso</span>
              <span className="quick-action-subtitle">Entrada de dinero</span>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-btn quick-action-expense"
            onClick={() => handleOpenTxModal('Expense')}
            aria-label="Registrar Nuevo Egreso"
          >
            <div className="quick-action-icon-wrapper">
              <BsArrowUpRight />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Nuevo Egreso</span>
              <span className="quick-action-subtitle">Gasto o pago diario</span>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-btn quick-action-transfer"
            onClick={() => handleOpenTxModal('Transfer')}
            aria-label="Realizar Transferencia"
          >
            <div className="quick-action-icon-wrapper">
              <BsArrowLeftRight />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Transferencia</span>
              <span className="quick-action-subtitle">Entre mis cuentas</span>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-btn quick-action-debt"
            onClick={handleOpenDebtModal}
            aria-label="Registrar Nueva Deuda"
          >
            <div className="quick-action-icon-wrapper">
              <BsReceiptCutoff />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Nueva Deuda</span>
              <span className="quick-action-subtitle">Cobro o pago diferido</span>
            </div>
          </button>
        </div>

        {/* B. FILTRO GLOBAL TEMPORAL */}
        <div className="dashboard-filter-bar">
          <div className="dashboard-month-selector">
            <button
              type="button"
              className="dashboard-month-nav-btn"
              onClick={handlePrevMonth}
              title="Mes anterior"
              aria-label="Mes anterior"
            >
              <BsChevronLeft />
            </button>
            <input
              type="month"
              className="dashboard-month-input"
              value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
              onChange={handleMonthChange}
              aria-label="Seleccionar mes y año"
            />
            <button
              type="button"
              className="dashboard-month-nav-btn"
              onClick={handleNextMonth}
              title="Mes siguiente"
              aria-label="Mes siguiente"
            >
              <BsChevronRight />
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              type="button"
              className="dashboard-reset-month-btn"
              onClick={handleResetToCurrentMonth}
            >
              Mes actual
            </button>
          )}
        </div>

        {/* C. TARJETAS DE MÉTRICAS (BODYCONTENT CON 4 CARDS) */}
        <BodyContent className="dashboard-metrics-wrapper">
          {/* Card 1: Ingresos del Mes */}
          <div className="dashboard-metric-card metric-income">
            <div className="dashboard-metric-header">
              <span className="dashboard-metric-title">Ingresos del Mes</span>
              <div className="dashboard-metric-icon">
                <BsArrowDownLeft />
              </div>
            </div>
            <p className="dashboard-metric-amount metric-income-text">
              {formatCurrency(summary?.monthlyIncome ?? 0)}
            </p>
            <span className="dashboard-metric-subtitle">
              Total percibido en el mes
            </span>
          </div>

          {/* Card 2: Egresos del Mes */}
          <div className="dashboard-metric-card metric-expense">
            <div className="dashboard-metric-header">
              <span className="dashboard-metric-title">Egresos del Mes</span>
              <div className="dashboard-metric-icon">
                <BsArrowUpRight />
              </div>
            </div>
            <p className="dashboard-metric-amount metric-expense-text">
              {formatCurrency(summary?.monthlyExpense ?? 0)}
            </p>
            <span className="dashboard-metric-subtitle">
              Total gastado en el mes
            </span>
          </div>

          {/* Card 3: Flujo / Balance */}
          <div className="dashboard-metric-card metric-balance">
            <div className="dashboard-metric-header">
              <span className="dashboard-metric-title">Flujo / Balance</span>
              <div className="dashboard-metric-icon">
                <BsWallet2 />
              </div>
            </div>
            <p
              className={`dashboard-metric-amount ${monthlyBalance > 0
                ? 'metric-income-text'
                : monthlyBalance < 0
                  ? 'metric-expense-text'
                  : 'metric-neutral-text'
                }`}
            >
              {formatCurrency(monthlyBalance)}
            </p>
            <span className="dashboard-metric-subtitle">
              {monthlyBalance >= 0 ? 'Superávit neto' : 'Déficit neto'}
            </span>
          </div>

          {/* Card 4: Patrimonio Neto */}
          <div className="dashboard-metric-card metric-networth">
            <div className="dashboard-metric-header">
              <span className="dashboard-metric-title">Patrimonio Neto</span>
              <div className="dashboard-metric-icon">
                <BsPiggyBank />
              </div>
            </div>
            <p className="dashboard-metric-amount metric-dark-text">
              {formatCurrency(summary?.netWorth ?? 0)}
            </p>
            <span className="dashboard-metric-subtitle">
              Balance activo menos deudas
            </span>
          </div>
        </BodyContent>

        {/* D. INSIGHTS (PARTE INFERIOR - 2 COLUMNAS) */}
        <div className="dashboard-insights-grid">
          {/* Izquierda: Gastos por Categoría */}
          <div className="dashboard-insight-card">
            <div className="dashboard-insight-header">
              <h2 className="dashboard-insight-title">
                <BsPieChart className="dashboard-insight-icon" />
                Gastos por Categoría
              </h2>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Top del período
              </span>
            </div>

            {summaryLoading && !summary ? (
              <div className="dashboard-empty-state">
                <Loading />
              </div>
            ) : summary?.topCategories && summary.topCategories.length > 0 ? (
              <div className="category-insights-list">
                {summary.topCategories.map((cat, index) => (
                  <div className="category-insight-item" key={cat.id || index}>
                    <div className="category-insight-row">
                      <span className="category-insight-name">{cat.name}</span>
                      <div className="category-insight-right">
                        <span className="category-insight-amount">
                          {formatCurrency(cat.totalAmount)}
                        </span>
                        <span className="category-percentage-badge">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="category-progress-track">
                      <div
                        className="category-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(cat.percentage, 4))}%`,
                          backgroundColor:
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <BsPieChart size={36} />
                <p>No hay gastos registrados en este mes</p>
              </div>
            )}
          </div>

          {/* Derecha: Últimos Movimientos */}
          <div className="dashboard-insight-card">
            <div className="dashboard-insight-header">
              <h2 className="dashboard-insight-title">
                <BsClockHistory className="dashboard-insight-icon" />
                Últimos Movimientos
              </h2>
              <Link to="/transactions" className="dashboard-view-all-link">
                Ver todas <BsArrowRightShort size={20} />
              </Link>
            </div>

            {summaryLoading && !summary ? (
              <div className="dashboard-empty-state">
                <Loading />
              </div>
            ) : summary?.recentTransactions &&
              summary.recentTransactions.length > 0 ? (
              <div className="recent-transactions-list">
                {summary.recentTransactions.map((tx) => (
                  <div className="recent-tx-item" key={tx.id}>
                    <div className="recent-tx-left">
                      <div
                        className={`recent-tx-icon ${tx.type === 'Income'
                          ? 'income'
                          : tx.type === 'Expense'
                            ? 'expense'
                            : 'transfer'
                          }`}
                      >
                        {tx.type === 'Income' ? (
                          <BsArrowDownLeft />
                        ) : tx.type === 'Expense' ? (
                          <BsArrowUpRight />
                        ) : (
                          <BsArrowLeftRight />
                        )}
                      </div>
                      <div className="recent-tx-info">
                        <span
                          className="recent-tx-description"
                          title={
                            tx.description ||
                            (tx.type === 'Transfer'
                              ? 'Transferencia'
                              : 'Sin descripción')
                          }
                        >
                          {tx.description ||
                            (tx.type === 'Transfer'
                              ? 'Transferencia'
                              : 'Sin descripción')}
                        </span>
                        <div className="recent-tx-meta">
                          <span>{formatDate(tx.date)}</span>
                          {tx.accountName && (
                            <span
                              className="recent-tx-badge"
                              title={tx.accountName}
                            >
                              {tx.accountName}
                            </span>
                          )}
                          {tx.categoryName && (
                            <span
                              className="recent-tx-badge"
                              title={tx.categoryName}
                            >
                              {tx.categoryName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`recent-tx-amount ${tx.type === 'Income'
                        ? 'income'
                        : tx.type === 'Expense'
                          ? 'expense'
                          : 'transfer'
                        }`}
                    >
                      {tx.type === 'Income'
                        ? `+${formatCurrency(tx.amount)}`
                        : tx.type === 'Expense'
                          ? `-${formatCurrency(tx.amount)}`
                          : formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <BsClockHistory size={36} />
                <p>No hay movimientos registrados recientemente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TRANSACCIÓN (INGRESO / EGRESO / TRANSFERENCIA) */}
      <ModalPost
        title={txModalTitle}
        id="dashboard-transaction-modal"
        formId="dashboard-transaction-form"
        loading={txLoading || isTxSuccessClosing}
      >
        <TransactionForm
          key={modalTxType}
          onSubmit={handleTransactionSubmit}
          loading={txLoading}
          errorMessage={txError}
          successMessage={txSuccess}
          clearError={clearTxError}
          clearSuccess={clearTxSuccess}
          defaultValues={{ type: modalTxType }}
          modalId="dashboard-transaction-modal"
          formId="dashboard-transaction-form"
        />
      </ModalPost>

      {/* MODAL DEUDA */}
      <ModalPost
        title="Nueva Deuda"
        id="dashboard-debt-modal"
        formId="dashboard-debt-form"
        loading={debtLoading || isDebtSuccessClosing}
      >
        <DebtForm
          debts={debts}
          onSubmit={handleDebtSubmit}
          loading={debtLoading}
          errorMessage={debtError}
          successMessage={debtSuccess}
          clearError={clearDebtError}
          clearSuccess={clearDebtSuccess}
          modalId="dashboard-debt-modal"
          formId="dashboard-debt-form"
        />
      </ModalPost>
    </MainLayout>
  );
};

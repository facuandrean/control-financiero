import { BsArrowDownLeft, BsArrowUpRight, BsWallet2 } from 'react-icons/bs';
import type { Transaction } from '../../../types/transaction.types';
import './transactionMetrics.css';

interface TransactionMetricsProps {
  transactions: Transaction[];
}

export const TransactionMetrics = ({ transactions }: TransactionMetricsProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="transaction-metrics-container">
      {/* Ingresos */}
      <div className="transaction-metric-card metric-income">
        <div className="transaction-metric-header">
          <span className="transaction-metric-title">Ingresos</span>
          <div className="transaction-metric-icon">
            <BsArrowDownLeft />
          </div>
        </div>
        <p className="transaction-metric-amount">{formatCurrency(totalIncome)}</p>
        <span className="transaction-metric-subtitle">Total ingresado</span>
      </div>

      {/* Egresos */}
      <div className="transaction-metric-card metric-expense">
        <div className="transaction-metric-header">
          <span className="transaction-metric-title">Egresos</span>
          <div className="transaction-metric-icon">
            <BsArrowUpRight />
          </div>
        </div>
        <p className="transaction-metric-amount">{formatCurrency(totalExpense)}</p>
        <span className="transaction-metric-subtitle">Total gastado</span>
      </div>

      {/* Balance Neto */}
      <div className="transaction-metric-card metric-balance">
        <div className="transaction-metric-header">
          <span className="transaction-metric-title">Balance</span>
          <div className="transaction-metric-icon">
            <BsWallet2 />
          </div>
        </div>
        <p
          className={`transaction-metric-amount ${
            netBalance > 0
              ? 'is-positive'
              : netBalance < 0
              ? 'is-negative'
              : 'is-zero'
          }`}
        >
          {formatCurrency(netBalance)}
        </p>
        <span className="transaction-metric-subtitle">
          {netBalance >= 0 ? 'Superávit del período' : 'Déficit del período'}
        </span>
      </div>
    </div>
  );
};

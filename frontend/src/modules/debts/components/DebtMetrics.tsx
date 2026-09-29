import { BsArrowDownLeft, BsArrowUpRight, BsWallet2 } from 'react-icons/bs';
import type { Debt } from '../../../types/debt.types';
import './debtMetrics.css';

interface DebtMetricsProps {
  debts: Debt[];
}

export const DebtMetrics = ({ debts }: DebtMetricsProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  // Total a pagar (Pendientes y Parciales)
  const totalPayable = debts
    .filter((d) => d.type === 'Payable' && d.status !== 'Settled')
    .reduce(
      (acc, d) =>
        acc +
        (d.remainingAmount ??
          (d.balance !== undefined
            ? Math.max(0, d.balance)
            : Math.max(
                0,
                (d.totalAmount ?? d.initialAmount ?? 0) - (d.paidAmount ?? 0)
              ))),
      0
    );

  // Total a cobrar (Pendientes y Parciales)
  const totalReceivable = debts
    .filter((d) => d.type === 'Receivable' && d.status !== 'Settled')
    .reduce(
      (acc, d) =>
        acc +
        (d.remainingAmount ??
          (d.balance !== undefined
            ? Math.max(0, d.balance)
            : Math.max(
                0,
                (d.totalAmount ?? d.initialAmount ?? 0) - (d.paidAmount ?? 0)
              ))),
      0
    );

  const netBalance = totalReceivable - totalPayable;

  return (
    <div className="debt-metrics-container">
      {/* Tarjeta DEBO */}
      <div className="debt-metric-card metric-payable">
        <div className="debt-metric-header">
          <span className="debt-metric-title">Debo (Por Pagar)</span>
          <div className="debt-metric-icon">
            <BsArrowDownLeft />
          </div>
        </div>
        <p className="debt-metric-amount">{formatCurrency(totalPayable)}</p>
        <span className="debt-metric-subtitle">Saldo pendiente a pagar</span>
      </div>

      {/* Tarjeta ME DEBEN */}
      <div className="debt-metric-card metric-receivable">
        <div className="debt-metric-header">
          <span className="debt-metric-title">Me Deben (Por Cobrar)</span>
          <div className="debt-metric-icon">
            <BsArrowUpRight />
          </div>
        </div>
        <p className="debt-metric-amount">{formatCurrency(totalReceivable)}</p>
        <span className="debt-metric-subtitle">Saldo pendiente a cobrar</span>
      </div>

      {/* Tarjeta BALANCE NETO */}
      <div className="debt-metric-card metric-net">
        <div className="debt-metric-header">
          <span className="debt-metric-title">Balance Neto</span>
          <div className="debt-metric-icon">
            <BsWallet2 />
          </div>
        </div>
        <p
          className={`debt-metric-amount ${
            netBalance > 0
              ? 'is-positive'
              : netBalance < 0
              ? 'is-negative'
              : 'is-zero'
          }`}
        >
          {formatCurrency(netBalance)}
        </p>
        <span className="debt-metric-subtitle">
          {netBalance >= 0 ? 'A favor acumulado' : 'En contra acumulado'}
        </span>
      </div>
    </div>
  );
};

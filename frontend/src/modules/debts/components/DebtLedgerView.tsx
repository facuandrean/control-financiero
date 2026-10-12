import React from 'react';
import { BsArrowLeft, BsPlusLg, BsTrash, BsPencil } from 'react-icons/bs';
import { BodyContent } from '../../../components/layout';
import type { Debt, DebtMovement } from '../../../types/debt.types';
import './debtLedgerView.css';

interface DebtLedgerViewProps {
  debt: Debt;
  onBack: () => void;
  onOpenChargeModal: (debt: Debt) => void;
  onOpenPaymentModal: (debt: Debt) => void;
  onRequestDeleteMovement: (movement: DebtMovement) => void;
  onEditInitialAmount?: (debt: Debt) => void;
}

export const DebtLedgerView: React.FC<DebtLedgerViewProps> = ({
  debt,
  onBack,
  onOpenChargeModal,
  onOpenPaymentModal,
  onRequestDeleteMovement,
  onEditInitialAmount,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const clean = dateString.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const movements = debt.movements || [];

  // Ordenar movimientos por fecha más reciente arriba
  const sortedMovements = [...movements].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeA !== timeB) return timeB - timeA;
    const createA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createB - createA;
  });

  const totalCharges =
    debt.totalCharges ??
    movements
      .filter((m) => m.type === 'CHARGE')
      .reduce((sum, m) => sum + m.amount, 0);

  const totalPayments =
    debt.totalPayments ??
    movements
      .filter((m) => m.type === 'PAYMENT')
      .reduce((sum, m) => sum + m.amount, 0);

  const initialAmount = debt.initialAmount ?? 0;
  const balance =
    debt.balance !== undefined
      ? debt.balance
      : initialAmount + totalCharges - totalPayments;

  const isSettled = debt.status === 'Settled' || balance <= 0;

  return (
    <div className="debt-ledger-view">
      {/* 1. ENCABEZADO Y NAVEGACIÓN */}
      <div className="debt-ledger-header">
        <div className="debt-ledger-header-info">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 mb-2 btn-back-to-debts"
            onClick={onBack}
          >
            <BsArrowLeft className="me-1" /> Volver a Deudas y Cobros
          </button>
          <div className="debt-ledger-title-group">
            <h1 className="debt-ledger-title">Cuenta de {debt.entity?.name || 'Sin entidad'}</h1>
            <span
              className={`debt-type-pill ${debt.type === 'Receivable' ? 'pill-receivable' : 'pill-payable'
                }`}
            >
              {debt.type === 'Receivable' ? 'Me deben (Cobro)' : 'Debo (Pago)'}
            </span>
          </div>
        </div>

        <div className="debt-ledger-header-actions">
          <button
            type="button"
            className="btn btn-ledger-action btn-timeline-charge"
            onClick={() => onOpenChargeModal(debt)}
          >
            Añadir cargo
          </button>
          <button
            type="button"
            className="btn btn-ledger-action btn-timeline-payment"
            onClick={() => onOpenPaymentModal(debt)}
          >
            Registrar pago
          </button>
        </div>
      </div>

      {/* 2. TARJETA DE BALANCE RESUMEN */}
      <BodyContent className="debt-ledger-summary-box">
        <div className="debt-ledger-summary-grid">
          {/* Deuda Inicial */}
          <div className="summary-tile">
            <div className="summary-tile-header">
              <span className="summary-tile-label">Deuda Inicial</span>
              {onEditInitialAmount && (
                <button
                  type="button"
                  className="btn-edit-initial-amount"
                  onClick={() => onEditInitialAmount(debt)}
                  title="Editar monto inicial"
                >
                  <BsPencil size={12} />
                </button>
              )}
            </div>
            <span className="summary-tile-value">
              {formatCurrency(initialAmount)}
            </span>
          </div>

          {/* Total Cargos */}
          <div className="summary-tile">
            <div className="summary-tile-header">
              <span className="summary-tile-label">Total Cargos</span>
            </div>
            <span className="summary-tile-value text-danger">
              +{formatCurrency(totalCharges)}
            </span>
          </div>

          {/* Total Pagos */}
          <div className="summary-tile">
            <div className="summary-tile-header">
              <span className="summary-tile-label">Total Pagos</span>
            </div>
            <span className="summary-tile-value text-success">
              -{formatCurrency(totalPayments)}
            </span>
          </div>

          {/* Saldo Pendiente Actual */}
          <div className="summary-tile summary-tile-highlight">
            <div className="summary-tile-header">
              <span className="summary-tile-label">Saldo Pendiente Actual</span>
              <span
                className={`debt-status-badge ${isSettled ? 'badge-settled' : 'badge-pending'
                  }`}
              >
                {isSettled ? 'Saldada' : 'Pendiente'}
              </span>
            </div>
            <span
              className={`summary-tile-value summary-tile-value-large ${isSettled
                ? 'text-success'
                : debt.type === 'Payable'
                  ? 'text-danger'
                  : 'text-success'
                }`}
            >
              {formatCurrency(Math.max(0, balance))}
            </span>
          </div>
        </div>
      </BodyContent>

      {/* 3. TABLA DE MOVIMIENTOS */}
      <BodyContent className="debt-ledger-table-box">
        <div className="table-responsive">
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Fecha</th>
                <th style={{ width: '10%' }}>Tipo</th>
                <th style={{ width: '40%' }}>Concepto / Descripción</th>
                <th style={{ width: '13%' }}>Cuenta</th>
                <th style={{ width: '15%' }}>Monto</th>
                <th style={{ width: '35px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="ledger-empty-state">
                      <p className="ledger-empty-title">
                        No hay movimientos registrados en esta libreta aún
                      </p>
                      <p className="ledger-empty-subtitle">
                        Utiliza los botones superiores para registrar un cargo o
                        pago.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedMovements.map((movement) => {
                  const isCharge = movement.type === 'CHARGE';
                  return (
                    <tr key={movement.id}>
                      {/* 1. Fecha */}
                      <td>{formatDate(movement.date)}</td>

                      {/* 2. Tipo */}
                      <td>
                        <span
                          className={
                            isCharge ? 'pill-expense' : 'pill-income'
                          }
                        >
                          {isCharge ? 'Cargo' : 'Pago'}
                        </span>
                      </td>

                      {/* 3. Concepto / Descripción */}
                      <td>
                        <div
                          className="ledger-concept-text"
                          title={movement.description}
                        >
                          {movement.description || '-'}
                        </div>
                      </td>

                      {/* 4. Cuenta */}
                      <td>
                        <span className="ledger-account-text">
                          {movement.accountName || '-'}
                        </span>
                      </td>

                      {/* 5. Monto */}
                      <td>
                        <span
                          className='fw-bold'
                          style={{ color: isCharge ? '#c46262' : '#4c9767' }}
                        >
                          {isCharge ? '+' : '-'}
                          {formatCurrency(movement.amount)}
                        </span>
                      </td>

                      {/* 6. Acción */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-delete-movement-action"
                          onClick={() => onRequestDeleteMovement(movement)}
                          title="Eliminar movimiento"
                        >
                          <BsTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </BodyContent>
    </div>
  );
};

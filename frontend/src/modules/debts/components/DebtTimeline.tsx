import { BsTrash, BsPlusCircle, BsCashCoin, BsCalendar3 } from 'react-icons/bs';
import type { Debt, DebtMovement } from '../../../types/debt.types';
import './debtCard.css';

interface DebtTimelineProps {
  debt: Debt;
  onRequestDeleteMovement: (movement: DebtMovement) => void;
  onOpenChargeModal: (debt: Debt) => void;
  onOpenPaymentModal: (debt: Debt) => void;
}

export const DebtTimeline = ({
  debt,
  onRequestDeleteMovement,
  onOpenChargeModal,
  onOpenPaymentModal,
}: DebtTimelineProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const cleanDate = dateString.split('T')[0];
    const parts = cleanDate.split('-');

    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day.split(' ')[0]}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return dateString;
  };

  const movements = debt.movements || [];

  // Orden de arriba para abajo:
  // El monto inicial sale arriba de todo y de ahí los nuevos cargos/pagos cronológicamente abajo
  const sortedMovements = [...movements].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeA !== timeB) return timeA - timeB;
    const createA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createA - createB;
  });

  const balance = debt.balance ?? (debt.initialAmount ?? 0);
  const isSettled = debt.status === 'Settled' || balance <= 0;

  return (
    <div className="debt-timeline-wrapper">
      {/* Resumen general de la libreta */}
      <div className="debt-timeline-summary">
        <div className="debt-timeline-summary-row">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Persona / Entidad:
          </span>
          <strong className="text-dark">{debt.entity?.name || 'Entidad'}</strong>
        </div>
        <div className="debt-timeline-summary-row">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Tipo de cuenta:
          </span>
          <span
            className={`debt-type-pill ${debt.type === 'Receivable' ? 'pill-receivable' : 'pill-payable'
              }`}
          >
            {debt.type === 'Receivable' ? 'Me deben (Cobro)' : 'Debo (Pago)'}
          </span>
        </div>
        <div className="debt-timeline-summary-row">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Estado:
          </span>
          <span
            className={`debt-status-badge ${isSettled ? 'badge-settled' : 'badge-pending'
              }`}
          >
            {isSettled ? 'Saldada' : 'Pendiente'}
          </span>
        </div>
        <div className="debt-timeline-summary-row">
          <span className="fw-bold" style={{ fontSize: '0.95rem' }}>
            Saldo pendiente actual:
          </span>
          <strong
            style={{
              fontSize: '1.25rem',
              color: isSettled
                ? '#15803d'
                : debt.type === 'Payable'
                  ? '#c46262'
                  : '#15803d',
            }}
          >
            {formatCurrency(Math.max(0, balance))}
          </strong>
        </div>
      </div>

      {/* Contenedor con scroll para la Línea de Tiempo */}
      <div className="debt-timeline-scroll">
        {/* 1. Tarjeta estática arriba de todo: Deuda Inicial */}
        <div className="movement-timeline-card movement-initial">
          <div className="movement-card-header">
            <span className="movement-pill pill-initial">Punto de partida</span>
            <span className="movement-card-date">
              {formatDate(debt.createdAt)}
            </span>
          </div>
          <div className="movement-card-content">
            <div className="movement-card-desc">Deuda Inicial</div>
            <div className="movement-card-amount amount-initial">
              {formatCurrency(debt.initialAmount ?? 0)}
            </div>
          </div>
        </div>

        {/* 2. Movimientos agregados uno abajo del otro en orden cronológico */}
        {sortedMovements.map((m) => (
          <div
            key={m.id}
            className={`movement-timeline-card ${m.type === 'CHARGE' ? 'movement-charge' : 'movement-payment'
              }`}
          >
            <div className="movement-card-header">
              <span
                className={`movement-pill ${m.type === 'CHARGE' ? 'pill-charge' : 'pill-payment'
                  }`}
              >
                {m.type === 'CHARGE' ? 'Cargo (+)' : 'Pago (-)'}
              </span>
              <span className="movement-card-date">
                <BsCalendar3 size={11} className="me-1" />
                {formatDate(m.date)}
              </span>
            </div>

            <div className="movement-card-content">
              <div className="movement-card-desc" title={m.description}>
                {m.description}
              </div>
              <div
                className={`movement-card-amount ${m.type === 'CHARGE' ? 'amount-charge' : 'amount-payment'
                  }`}
              >
                {m.type === 'CHARGE' ? '+' : '-'} {formatCurrency(m.amount)}
              </div>
            </div>

            <div className="movement-card-footer">
              {m.transactionID ? (
                <span className="movement-tx-badge" title="Vinculado a transacción bancaria">
                  🏦 Cuenta bancaria afectada
                </span>
              ) : (
                <span />
              )}

              <button
                type="button"
                className="btn-delete-movement"
                onClick={() => onRequestDeleteMovement(m)}
                title="Eliminar movimiento"
              >
                <BsTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer del Modal con los dos botones de acción en tonos pasteles */}
      <div className="debt-timeline-footer-actions">
        <button
          type="button"
          className="btn-timeline-action btn-timeline-charge"
          onClick={() => onOpenChargeModal(debt)}
        >
          <BsPlusCircle size={16} />
          <span>Nuevo Cargo</span>
        </button>

        <button
          type="button"
          className="btn-timeline-action btn-timeline-payment"
          onClick={() => onOpenPaymentModal(debt)}
        >
          <BsCashCoin size={16} />
          <span>Registrar Pago</span>
        </button>
      </div>
    </div>
  );
};

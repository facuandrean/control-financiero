import { BsTrash, BsJournalText } from 'react-icons/bs';
import type { Debt } from '../../../types/debt.types';
import './debtCard.css';

interface DebtCardProps {
  debt: Debt;
  onSelectDebt: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onAddPayment?: (debt: Debt) => void;
  onEdit?: (debt: Debt) => void;
  onDeletePayment?: (paymentId: string) => Promise<boolean | void>;
}

export const DebtCard = ({
  debt,
  onSelectDebt,
  onDelete,
}: DebtCardProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const balance = debt.balance ?? (debt.initialAmount ?? 0);
  const isSettled = debt.status === 'Settled' || balance <= 0;
  const movementsCount = debt.movements?.length ?? 0;

  const getStatusBadge = () => {
    if (isSettled) {
      return <span className="debt-status-badge badge-settled">Saldada</span>;
    }
    return <span className="debt-status-badge badge-pending">Pendiente</span>;
  };

  return (
    <div
      className="debt-card"
      onClick={() => onSelectDebt(debt)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelectDebt(debt);
        }
      }}
    >
      <div className="debt-card-header">
        <div className="debt-card-title-group">
          <h3 className="debt-card-entity" title={debt.entity?.name || 'Sin entidad'}>
            {debt.entity?.name || 'Entidad no especificada'}
          </h3>
          <span
            className={`debt-type-pill ${
              debt.type === 'Receivable' ? 'pill-receivable' : 'pill-payable'
            }`}
          >
            {debt.type === 'Receivable' ? 'Me deben' : 'Debo'}
          </span>
        </div>
        <div className="debt-card-badges">{getStatusBadge()}</div>
      </div>

      <div className="debt-card-body">
        {/* Balance Total Calculado */}
        <div className="debt-card-balance-box">
          <span className="debt-card-balance-label">
            {isSettled ? 'Cuenta Saldada' : 'Saldo Pendiente'}
          </span>
          <span
            className={`debt-card-balance-value ${
              isSettled
                ? 'value-settled'
                : debt.type === 'Payable'
                ? 'value-payable'
                : 'value-receivable'
            }`}
          >
            {formatCurrency(Math.max(0, balance))}
          </span>
        </div>

        {/* Información secundaria de la libreta */}
        <div className="debt-card-subinfo">
          <span>Deuda Inicial: {formatCurrency(debt.initialAmount ?? 0)}</span>
          <span className="debt-card-movements-count">
            {movementsCount} {movementsCount === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>
      </div>

      <div className="debt-card-footer">
        <button
          type="button"
          className="btn-card-action btn-timeline-open"
          onClick={(e) => {
            e.stopPropagation();
            onSelectDebt(debt);
          }}
          title="Ver libreta y registrar cargos o pagos"
        >
          <BsJournalText />
          <span>Ver Libreta</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-icon-only btn-delete-debt"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(debt);
          }}
          title="Eliminar cuenta de deuda"
        >
          <BsTrash />
        </button>
      </div>
    </div>
  );
};

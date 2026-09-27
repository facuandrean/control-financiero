import { BsPencil, BsTrash, BsCashCoin, BsCalendar3 } from 'react-icons/bs';
import type { Debt } from '../../../types/debt.types';
import './debtCard.css';

interface DebtCardProps {
  debt: Debt;
  onAddPayment: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export const DebtCard = ({ debt, onAddPayment, onEdit, onDelete }: DebtCardProps) => {
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
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
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

  const paid = debt.paidAmount ?? debt.totalPaid ?? 0;
  const total = debt.totalAmount;
  const percentage = Math.min(100, Math.max(0, Math.round((paid / total) * 100)));
  const remaining = debt.remainingAmount ?? Math.max(0, total - paid);

  const getStatusBadge = () => {
    switch (debt.status) {
      case 'Settled':
        return <span className="debt-status-badge badge-settled">Saldada</span>;
      case 'Partial':
        return <span className="debt-status-badge badge-partial">Parcial</span>;
      default:
        return <span className="debt-status-badge badge-pending">Pendiente</span>;
    }
  };

  return (
    <div className="debt-card">
      <div className="debt-card-header">
        <div className="debt-card-title-group">
          <h3 className="debt-card-entity" title={debt.entity?.name || 'Sin entidad'}>
            {debt.entity?.name || 'Entidad no especificada'}
          </h3>
          <span
            className={`debt-type-pill ${debt.type === 'Receivable' ? 'pill-receivable' : 'pill-payable'
              }`}
          >
            {debt.type === 'Receivable' ? 'Me deben' : 'Debo'}
          </span>
        </div>
        <div className="debt-card-badges">{getStatusBadge()}</div>
      </div>

      <div className="debt-card-body">
        <p className="debt-card-desc" title={debt.description}>
          {debt.description}
        </p>

        <div className="debt-due-date">
          <BsCalendar3 size={13} />
          <span>
            {debt.dueDate ? `Vence: ${formatDate(debt.dueDate)}` : 'Sin fecha de vencimiento'}
          </span>
        </div>

        <div className="debt-progress-wrapper">
          <div className="debt-progress-labels">
            <span className="debt-progress-text">Progreso ({percentage}%)</span>
            <span className="debt-progress-amounts">
              {formatCurrency(paid)} / {formatCurrency(total)}
            </span>
          </div>
          <div className="debt-progress-track">
            <div
              className={`debt-progress-fill ${debt.type === 'Receivable' ? 'fill-receivable' : 'fill-payable'
                }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {debt.status !== 'Settled' && (
            <div className="debt-remaining-info">
              Resta: <strong>{formatCurrency(remaining)}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="debt-card-footer">
        <button
          className="btn-card-action btn-pay"
          onClick={() => onAddPayment(debt)}
          disabled={debt.status === 'Settled'}
          title={
            debt.status === 'Settled'
              ? 'Esta deuda ya se encuentra saldada'
              : 'Registrar un pago parcial o total'
          }
        >
          <BsCashCoin />
          <span>Registrar Pago</span>
        </button>

        <div className="debt-card-action-group">
          <button
            className="btn-card-action btn-icon-only btn-edit-debt"
            onClick={() => onEdit(debt)}
            title="Editar deuda"
          >
            <BsPencil />
          </button>
          <button
            className="btn-card-action btn-icon-only btn-delete-debt"
            onClick={() => onDelete(debt)}
            title="Eliminar deuda"
          >
            <BsTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

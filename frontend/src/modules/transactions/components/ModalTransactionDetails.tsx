import { useEffect, useRef } from 'react';
import { BsPencil, BsTrash } from 'react-icons/bs';
import type { Transaction } from '../../../types/transaction.types';
import type { RecentTransactionItem } from '../../../types/dashboard.types';
import { closeModal, onModalHidden } from '../../../utils/modal.utils';
import './modalTransactionDetails.css';

export type TransactionDetailData = Transaction | RecentTransactionItem;

interface ModalTransactionDetailsProps {
  id?: string;
  transaction: TransactionDetailData | null;
  onEdit?: (tx: TransactionDetailData) => void;
  onDelete?: (tx: TransactionDetailData) => void;
  onClose?: () => void;
}

export const ModalTransactionDetails = ({
  id = 'modal-transaction-details',
  transaction,
  onEdit,
  onDelete,
  onClose,
}: ModalTransactionDetailsProps) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    return onModalHidden(id, () => {
      onCloseRef.current?.();
    });
  }, [id]);

  const isIncome = transaction?.type === 'Income';
  const isExpense = transaction?.type === 'Expense';
  const isTransfer = transaction?.type === 'Transfer';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const clean = dateStr.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    try {
      const timePart = timeStr.includes(' ')
        ? timeStr.split(' ')[1]
        : timeStr.includes('T')
          ? timeStr.split('T')[1]
          : null;

      if (!timePart) return null;
      const [hours, minutes] = timePart.split(':');
      if (hours !== undefined && minutes !== undefined) {
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')} hs`;
      }
      return null;
    } catch {
      return null;
    }
  };

  type ExtendedTransactionDetails = Partial<RecentTransactionItem> &
    Partial<Transaction> & {
      accountName?: string | null;
      categoryName?: string | null;
      entityName?: string | null;
      toAccountName?: string | null;
      installments?: number;
      createdAt?: string;
    };

  const txRecord = (transaction || {}) as ExtendedTransactionDetails;

  const recordTime = (() => {
    if (transaction?.date && transaction.date.includes('T')) {
      const timePart = transaction.date.split('T')[1];
      if (timePart && !timePart.startsWith('00:00:00')) {
        return formatTime(transaction.date);
      }
    }
    if (txRecord.createdAt) {
      return formatTime(txRecord.createdAt);
    }
    return null;
  })();
  const accountName =
    txRecord.account?.name ||
    txRecord.accountName ||
    (isTransfer ? 'Cuenta origen' : 'Cuenta no especificada');

  const toAccountName = txRecord.toAccount?.name || null;
  const categoryName = txRecord.category?.name || txRecord.categoryName || null;
  const entityName = txRecord.entity?.name || txRecord.entityName || null;
  const installments = txRecord.installments || null;

  const handleEditClick = () => {
    closeModal({ idModal: id });
    if (onEdit && transaction) {
      setTimeout(() => onEdit(transaction), 150);
    }
  };

  const handleDeleteClick = () => {
    closeModal({ idModal: id });
    if (onDelete && transaction) {
      setTimeout(() => onDelete(transaction), 150);
    }
  };

  const typeLabel = isIncome ? 'Ingreso' : isExpense ? 'Egreso' : 'Transferencia';

  return (
    <div
      className="modal fade modal-tx-details"
      id={id}
      aria-hidden="true"
      aria-labelledby={`${id}Label`}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <h5 className="modal-title" id={`${id}Label`}>
                Detalle de {typeLabel}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
              onClick={onClose}
            />
          </div>

          {transaction ? (
            <>
              <div className="modal-body">
                {/* Monto principal */}
                <div className="text-center py-2 mb-3 border-bottom">
                  <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>
                    Monto
                  </span>
                  <h2
                    className="mb-0 fw-bold"
                    style={{
                      fontSize: '2rem',
                      color: isIncome ? '#4c9767' : isExpense ? '#c46262' : '#7a96b4',
                    }}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </h2>
                </div>

                {/* Lista de atributos de la transacción */}
                <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.9rem' }}>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Fecha:</span>
                    <strong className="text-dark">{formatDate(transaction.date)}</strong>
                  </div>

                  {recordTime && (
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Hora de registro:</span>
                      <strong className="text-dark">{recordTime}</strong>
                    </div>
                  )}

                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">{isTransfer ? 'Cuentas' : 'Cuenta'}:</span>
                    <strong className="text-dark text-end">
                      {isTransfer && toAccountName ? `${accountName} ➔ ${toAccountName}` : accountName}
                    </strong>
                  </div>

                  {categoryName && (
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Categoría:</span>
                      <strong className="text-dark">{categoryName}</strong>
                    </div>
                  )}

                  {entityName && (
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Entidad / Comercio:</span>
                      <strong className="text-dark">{entityName}</strong>
                    </div>
                  )}

                  {installments && installments > 1 && (
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Plan de Pago:</span>
                      <span className="badge bg-light text-dark border">{installments} Cuotas</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>
                      Descripción Completa:
                    </span>
                    <p
                      className="p-2 rounded bg-light border text-dark mb-0"
                      style={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.875rem',
                        minHeight: '40px',
                      }}
                    >
                      {transaction.description && transaction.description.trim() !== ''
                        ? transaction.description
                        : 'Sin descripción registrada'}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`modal-footer ${onDelete ? 'd-flex justify-content-between' : 'd-flex justify-content-end'}`}
              >
                {onDelete && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteClick}
                  >
                    <BsTrash className="me-1" /> Eliminar
                  </button>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>

                  {onEdit && (
                    <button
                      type="button"
                      className="btn btn-submit-post"
                      onClick={handleEditClick}
                    >
                      <BsPencil className="me-1" /> Editar
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

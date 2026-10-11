import { useEffect, useRef, useState } from 'react';
import { Loading, MessageError, MessageSuccess } from '../../../components/ui';
import { api } from '../../../api/axios';
import type { Transaction } from '../../../types/transaction.types';
import type { RecentTransactionItem } from '../../../types/dashboard.types';
import { closeModal, onModalHidden } from '../../../utils/modal.utils';
import './modalTransactionDetails.css';

export type TransactionDetailData = Transaction | RecentTransactionItem;

interface ModalTransactionDetailsProps {
  id?: string;
  transaction: TransactionDetailData | null;
  onDelete?: (tx: TransactionDetailData) => void;
  onUnpay?: (tx: TransactionDetailData) => Promise<boolean | void> | void;
  onClose?: () => void;
}

export const ModalTransactionDetails = ({
  id = 'modal-transaction-details',
  transaction,
  onDelete,
  onUnpay,
  onClose,
}: ModalTransactionDetailsProps) => {
  const [unpayLoading, setUnpayLoading] = useState(false);
  const [unpaySuccess, setUnpaySuccess] = useState<string | null>(null);
  const [unpayError, setUnpayError] = useState<string | null>(null);

  // Mantenemos los datos en caché para que durante la animación de cierre (fade-out de 300ms)
  // el modal conserve todo su cuerpo visible y no se desmonte antes de tiempo.
  const [cachedTransaction, setCachedTransaction] = useState<TransactionDetailData | null>(transaction);

  useEffect(() => {
    if (transaction) {
      setCachedTransaction(transaction);
    }
  }, [transaction]);

  const activeTransaction = transaction || cachedTransaction;

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    return onModalHidden(id, () => {
      setUnpayError(null);
      setUnpaySuccess(null);
      setUnpayLoading(false);
      setCachedTransaction(null);
      onCloseRef.current?.();
    });
  }, [id]);

  const isIncome = activeTransaction?.type === 'Income';
  const isExpense = activeTransaction?.type === 'Expense';
  const isTransfer = activeTransaction?.type === 'Transfer';

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

  const txRecord = (activeTransaction || {}) as ExtendedTransactionDetails;

  const recordTime = (() => {
    if (activeTransaction?.date && activeTransaction.date.includes('T')) {
      const timePart = activeTransaction.date.split('T')[1];
      if (timePart && !timePart.startsWith('00:00:00')) {
        return formatTime(activeTransaction.date);
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

  const toAccountName = txRecord.toAccount?.name || txRecord.toAccountName || null;
  const categoryName = txRecord.category?.name || txRecord.categoryName || null;
  const entityName = txRecord.entity?.name || txRecord.entityName || null;
  const installments = txRecord.installments || null;

  const isInstallmentPurchase = Boolean(
    (txRecord.installments && txRecord.installments > 1) ||
    txRecord.installmentGroupId ||
    txRecord.payingAccountID
  );
  const canUnpay = txRecord.status === 'paid' && isInstallmentPurchase;

  const handleUnpayClick = async () => {
    if (!activeTransaction) return;
    setUnpayLoading(true);
    setUnpayError(null);
    setUnpaySuccess(null);
    try {
      if (onUnpay) {
        await onUnpay(activeTransaction);
      } else {
        await api.post(`/transactions/${activeTransaction.id}/unpay`);
      }
      setUnpaySuccess('Pago deshecho correctamente');
      setTimeout(() => {
        closeModal({ idModal: id });
      }, 1000);
    } catch (err: any) {
      setUnpayError(
        err.response?.data?.message || err.message || 'Error al deshacer el pago'
      );
    } finally {
      setUnpayLoading(false);
    }
  };

  const handleDeleteClick = () => {
    closeModal({ idModal: id });
    if (onDelete && activeTransaction) {
      setTimeout(() => onDelete(activeTransaction), 150);
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
              disabled={unpayLoading}
            />
          </div>

          {activeTransaction ? (
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
                    {formatCurrency(activeTransaction.amount)}
                  </h2>
                </div>

                {/* Lista de atributos de la transacción */}
                <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.9rem' }}>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Fecha:</span>
                    <strong className="text-dark">{formatDate(activeTransaction.date)}</strong>
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

                  {txRecord.status && (
                    <div className="d-flex justify-content-between py-1 border-bottom align-items-center">
                      <span className="text-muted">Estado:</span>
                      <span className={`badge ${txRecord.status === 'pending' ? 'badge-pending' : 'badge-settled'}`} style={{ fontSize: '.8rem' }}>
                        {txRecord.status === 'pending' ? 'Pendiente de pago' : txRecord.status === 'paid' ? 'Pagada' : 'Completada'}
                      </span>
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
                      {activeTransaction.description && activeTransaction.description.trim() !== ''
                        ? activeTransaction.description
                        : 'Sin descripción registrada'}
                    </p>
                  </div>

                  {unpayLoading && (
                    <div className="d-flex justify-content-center mt-3">
                      <Loading />
                    </div>
                  )}

                  {unpaySuccess && !unpayLoading && (
                    <MessageSuccess message={unpaySuccess} className="mt-3" />
                  )}

                  {unpayError && !unpayLoading && (
                    <MessageError message={unpayError} className="mt-3" />
                  )}
                </div>
              </div>

              {(canUnpay || onDelete) && (
                <div className="modal-footer d-flex justify-content-end gap-2">
                  {canUnpay && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleUnpayClick}
                      disabled={unpayLoading}
                    >
                      Deshacer Pago
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteClick}
                      disabled={unpayLoading}
                    >
                      Eliminar transacción
                    </button>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

import {
  BsArrowDownLeft,
  BsArrowUpRight,
  BsArrowLeftRight,
  BsPencil,
  BsTrash,
} from 'react-icons/bs';
import type { Transaction } from '../../../types/transaction.types';
import './transactionList.css';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onViewDetails?: (tx: Transaction) => void;
}

export const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
  onViewDetails,
}: TransactionListProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

  const formatGroupDate = (dateKey: string) => {
    const parts = dateKey.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );

      const monthName = dateObj.toLocaleDateString('es-AR', { month: 'long' });

      if (dateObj.getTime() === today.getTime()) {
        return `Hoy, ${day} de ${monthName}`;
      }
      if (dateObj.getTime() === yesterday.getTime()) {
        return `Ayer, ${day} de ${monthName}`;
      }

      return `${day} de ${monthName} de ${year}`;
    }
    return dateKey;
  };

  if (transactions.length === 0) {
    return (
      <div className="transactions-empty">
        <p>No se encontraron transacciones en este período.</p>
      </div>
    );
  }

  // Agrupar por fecha (YYYY-MM-DD)
  const groupedTransactions: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const dateKey = tx.date ? tx.date.split('T')[0] : 'Sin fecha';
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(tx);
  });

  const sortedDateKeys = Object.keys(groupedTransactions).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="transaction-list-wrapper">
      {sortedDateKeys.map((dateKey) => {
        const items = groupedTransactions[dateKey];

        return (
          <div key={dateKey} className="transaction-date-group">
            <div className="transaction-date-header">
              <span>{formatGroupDate(dateKey)}</span>
            </div>

            <div className="transaction-items-box">
              {items.map((tx) => {
                const isIncome = tx.type === 'Income';
                const isExpense = tx.type === 'Expense';
                const isTransfer = tx.type === 'Transfer';

                const mainTitle = isTransfer
                  ? `${tx.account?.name || 'Origen'} ➔ ${tx.toAccount?.name || 'Destino'}`
                  : tx.entity?.name || tx.category?.name || tx.description || 'Transacción';

                const subParts: string[] = [];
                if (isTransfer) {
                  subParts.push('Transferencia entre cuentas');
                  if (tx.description) subParts.push(tx.description);
                } else {
                  if (tx.account?.name) {
                    subParts.push(`Cuenta: ${tx.account.name}`);
                  }
                  if (tx.category?.name && tx.entity?.name) {
                    subParts.push(tx.category.name);
                  }
                  if (tx.description && tx.description !== tx.entity?.name) {
                    subParts.push(tx.description);
                  }
                }

                return (
                  <div
                    key={tx.id}
                    className="transaction-item"
                    onClick={() => onViewDetails?.(tx)}
                  >
                    <div className="transaction-item-left">
                      <div
                        className={`transaction-icon-badge ${isIncome
                            ? 'badge-income'
                            : isExpense
                              ? 'badge-expense'
                              : 'badge-transfer'
                          }`}
                      >
                        {isIncome && <BsArrowDownLeft />}
                        {isExpense && <BsArrowUpRight />}
                        {isTransfer && <BsArrowLeftRight />}
                      </div>

                      <div className="transaction-info">
                        <div className="transaction-primary-row">
                          <h4 className="transaction-title" title={mainTitle}>
                            {mainTitle}
                          </h4>
                          <span
                            className={`transaction-type-pill ${isIncome
                                ? 'pill-income'
                                : isExpense
                                  ? 'pill-expense'
                                  : 'pill-transfer'
                              }`}
                          >
                            {isIncome
                              ? 'Ingreso'
                              : isExpense
                                ? 'Egreso'
                                : 'Transferencia'}
                          </span>
                        </div>
                        <p
                          className="transaction-subtitle"
                          title={subParts.join(' • ')}
                        >
                          {subParts.join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="transaction-item-right">
                      <span
                        className={`transaction-amount ${isIncome
                            ? 'amount-income'
                            : isExpense
                              ? 'amount-expense'
                              : 'amount-transfer'
                          }`}
                      >
                        {formatCurrency(tx.amount)}
                      </span>

                      <div className="transaction-actions">
                        <button
                          type="button"
                          className="btn-tx-action btn-tx-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(tx);
                          }}
                          title="Editar transacción"
                        >
                          <BsPencil />
                        </button>
                        <button
                          type="button"
                          className="btn-tx-action btn-tx-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(tx);
                          }}
                          title="Eliminar transacción"
                        >
                          <BsTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

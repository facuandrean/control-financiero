import type { Account } from '../../../types/account.types';
import { BsCash, BsBank, BsCreditCard, BsWallet2, BsPiggyBank } from "react-icons/bs";
import './accountListItem.css';

/**
 * Props for the AccountListItem component.
 * @property {Account} account - The account data to display.
 * @property {boolean} isSelected - Whether this account is currently selected.
 * @property {() => void} onClick - Callback function when the item is clicked.
 */
interface AccountListItemProps {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * AccountListItem Component
 * 
 * Renders a summary card for a single account in a list format.
 * It displays the account name, bank, and current balance.
 * If the account is a credit card, it visually represents the debt vs credit limit using a progress bar.
 * 
 * @param {AccountListItemProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const AccountListItem = ({ account, isSelected, onClick }: AccountListItemProps) => {
  const isCredit = account.type === 'Tarjeta de Crédito';

  /**
   * Formats a number into an Argentine Peso currency string.
   * @param {number} amount - The amount to format.
   * @returns {string} The formatted currency string.
   */
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  /**
   * Returns the appropriate icon based on the account type.
   * @returns {JSX.Element} The React Icon component.
   */
  const getIcon = () => {
    switch (account.type) {
      case 'Efectivo': return <BsCash />;
      case 'Tarjeta de Crédito': return <BsCreditCard />;
      case 'Billetera virtual': return <BsWallet2 />;
      case 'Caja de ahorro': return <BsPiggyBank />;
      default: return <BsBank />;
    }
  };

  /**
   * Returns a subtle pastel background color based on the account tag.
   * Uses solid light colors so dark text is readable.
   * @returns {string} The background color string.
   */
  const getPastelColor = () => {
    switch (account.tag) {
      case 'efectivo': return '#d1fae5'; // green pastel (emerald-100)
      case 'crédito': return '#fee2e2'; // red pastel (red-100)
      case 'billetera': return '#dbeafe'; // blue pastel (blue-100)
      case 'ahorro': return '#fef3c7'; // yellow pastel (amber-100)
      default: return '#ede9fe'; // purple pastel (violet-100)
    }
  };

  /**
   * Returns a solid pastel color for borders or icons.
   */
  const getSolidPastelColor = () => {
    switch (account.tag) {
      case 'efectivo': return '#059669'; // emerald-600
      case 'crédito': return '#c46262'; // red-600
      case 'billetera': return '#2563eb'; // blue-600
      case 'ahorro': return '#d97706'; // amber-600
      default: return '#7c3aed'; // violet-600
    }
  };

  return (
    <div
      className={`account-list-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        '--item-bg': isSelected ? getPastelColor() : 'transparent',
        '--item-hover-bg': isSelected ? getPastelColor() : `${getSolidPastelColor()}1A`, // 10% opacity del color principal
        borderLeft: `4px solid ${getSolidPastelColor()}`
      } as React.CSSProperties}
    >
      <div className="ali-header">
        <div className="ali-icon-box" style={{ color: getSolidPastelColor() }}>
          <i className="icon-placeholder">
            {getIcon()}
          </i>
        </div>
        <div className="ali-title-box">
          <h4>{account.name}</h4>
          <span>{account.bank}</span>
        </div>
        <div className="ali-arrow">›</div>
      </div>

      <div className="ali-body">
        {isCredit ? (
          <div className="ali-credit-info">
            <div className="ali-amounts">
              <span className="debt-amount">{formatMoney(account.amount || 0)}</span>
              <span className="limit-amount">/ {formatMoney(account.creditLimit || 0)}</span>
            </div>
            {/* Visual progress bar (calculates % used) */}
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `clamp(0%, ${((account.amount || 0) / (account.creditLimit || 1)) * 100}%, 100%)` }}
              ></div>
            </div>
          </div>
        ) : (
          <h3 className="balance-amount">{formatMoney(account.amount || 0)}</h3>
        )}
      </div>
    </div>
  );
};
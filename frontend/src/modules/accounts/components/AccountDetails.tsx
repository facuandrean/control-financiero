import type { Account } from '../../../types/account.types';
import { BsCash, BsBank, BsCreditCard, BsWallet2, BsPiggyBank, BsPencil, BsArrowDown, BsArrowUp } from "react-icons/bs";
import './accountDetails.css';

/**
 * Props for the AccountDetails component.
 * @property {Account} account - The account data to display.
 * @property {() => void} [onEdit] - Optional callback function to edit the account.
 * @property {() => void} [onDeactivate] - Optional callback function to deactivate/delete the account.
 */
interface Props {
  account: Account;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
}

/**
 * AccountDetails Component
 * 
 * Displays detailed information about a selected account in a minimalist layout.
 * It shows balances, credit limits (if applicable), and allows editing or deactivating the account.
 * 
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const AccountDetails = ({ account, onEdit, onDeactivate, onReactivate }: Props) => {
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
    switch(account.type) {
      case 'Efectivo': return <BsCash />;
      case 'Tarjeta de Crédito': return <BsCreditCard />;
      case 'Billetera virtual': return <BsWallet2 />;
      case 'Caja de ahorro': return <BsPiggyBank />;
      default: return <BsBank />;
    }
  };

  /**
   * Returns a solid pastel color for borders or icons based on the account tag.
   */
  const getSolidPastelColor = () => {
    switch(account.tag) {
      case 'efectivo': return '#059669'; 
      case 'crédito': return '#dc2626'; 
      case 'billetera': return '#2563eb'; 
      case 'ahorro': return '#d97706'; 
      default: return '#7c3aed'; 
    }
  };

  return (
    <div className="account-details-card">
      
      {/* CABECERA */}
      <div className="ad-header">
        <div className="ad-icon-box" style={{ color: getSolidPastelColor() }}>
          {getIcon()}
        </div>
        <div className="ad-title">
          <h2>{account.name}</h2>
          <p>{account.bank}</p>
          <span className={`account-badge badge-${account.tag}`}>{account.type}</span>
        </div>
      </div>

      {/* SALDO PRINCIPAL */}
      <div className="ad-main-balance">
        <p>{isCredit ? 'DEUDA ACTUAL' : 'SALDO DISPONIBLE'}</p>
        <h1>{formatMoney(account.amount || 0)}</h1>
      </div>

      {/* LISTA DE ATRIBUTOS (Se adapta) */}
      <div className="ad-attributes-list">
        <div className="ad-row">
          <span className="ad-label">Banco</span>
          <span className="ad-value">{account.bank}</span>
        </div>
        <div className="ad-row">
          <span className="ad-label">Tipo de cuenta</span>
          <span className="ad-value">{account.type}</span>
        </div>
        <div className="ad-row">
          <span className="ad-label">Estado</span>
          <span className="ad-value">{account.status === 'Active' ? 'Activa' : 'Inactiva'}</span>
        </div>
        {account.lastDigits && (
          <div className="ad-row">
            <span className="ad-label">Terminación</span>
            <span className="ad-value">**** {account.lastDigits}</span>
          </div>
        )}

        {isCredit && (
          <>
            <div className="ad-row">
              <span className="ad-label">Límite de crédito</span>
              <span className="ad-value">{formatMoney(account.creditLimit || 0)}</span>
            </div>
            {account.closingDay && (
              <div className="ad-row">
                <span className="ad-label">Día de cierre</span>
                <span className="ad-value">{account.closingDay} del mes</span>
              </div>
            )}
            {account.dueDate && (
              <div className="ad-row">
                <span className="ad-label">Día de vencimiento</span>
                <span className="ad-value">{account.dueDate} del mes</span>
              </div>
            )}
          </>
        )}

        {account.description && (
          <div className="ad-row description-row">
            <span className="ad-label">Descripción</span>
            <span className="ad-value">{account.description}</span>
          </div>
        )}
      </div>

      {/* BOTONERA ACCIONES */}
      <div className="ad-actions">
        {onEdit && account.status === 'Active' && (
          <button className="btn-edit-account" onClick={onEdit}>
            <BsPencil /> Editar
          </button>
        )}
        {onDeactivate && account.status === 'Active' && (
          <button className="btn-delete-account" onClick={onDeactivate} title="Dar de baja">
            <BsArrowDown /> Dar de baja
          </button>
        )}
        {onReactivate && account.status === 'Inactive' && (
          <button className="btn-reactivate-account" onClick={onReactivate} title="Reactivar">
            <BsArrowUp /> Reactivar
          </button>
        )}
      </div>

    </div>
  );
};
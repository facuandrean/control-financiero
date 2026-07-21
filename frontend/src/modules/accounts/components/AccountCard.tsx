import { Card } from '../../../components';
import { MessageInfo } from '../../../components/ui';
import type { Account } from '../../../types/account.types';
import './accountCard.css';

const getBodyContent = (account: Account) => {
  const normalizedType = account.type?.toLowerCase() ?? '';

  if (normalizedType.includes('corriente')) {
    return (
      <div className="account-card__content">
        <div className="account-card__amount">$ {account.amount}</div>
        {account.description && <div className="account-card__description">{account.description}</div>}
      </div>
    );
  }

  if (normalizedType.includes('efectivo')) {
    return (
      <div className="account-card__content">
        <div className="account-card__amount">$ {account.amount}</div>
        {account.description && <div className="account-card__description">{account.description}</div>}
      </div>
    );
  }

  if (normalizedType.includes('crédito') || normalizedType.includes('credito')) {
    return (
      <div className="account-card__content">
        <div className="account-card__amount">$ {account.amount}</div>
        {account.description && <div className="account-card__description">{account.description}</div>}
        {account.lastDigits && <div className="account-card__detail">Últimos dígitos: {account.lastDigits}</div>}
        {account.creditLimit !== undefined && account.creditLimit !== null && (
          <div className="account-card__detail">Límite: $ {account.creditLimit}</div>
        )}
        {account.closingDay !== undefined && account.closingDay !== null && (
          <div className="account-card__detail">Cierre: Día {account.closingDay}</div>
        )}
      </div>
    );
  }

  if (normalizedType.includes('débito') || normalizedType.includes('debito')) {
    return (
      <div className="account-card__content">
        <div className="account-card__amount">$ {account.amount}</div>
        {account.description && <div className="account-card__description">{account.description}</div>}
        {account.lastDigits && <div className="account-card__detail">Últimos dígitos: {account.lastDigits}</div>}
      </div>
    );
  }

  return (
    <div className="account-card__content">
      <div className="account-card__amount">$ {account.amount}</div>
      {account.description && <div className="account-card__description">{account.description}</div>}
    </div>
  );
};

export const AccountCard = () => {
  const accounts: Account[] = [
    { bank: 'Santander', name: 'Cuenta Corriente', amount: 2450000, type: 'Cuenta corriente', tag: 'corriente' },
    { bank: 'Caja', name: 'Efectivo', amount: 150000, type: 'Efectivo', tag: 'efectivo', description: 'Fondo disponible' },
    { bank: 'Santander', name: 'Tarjeta de Crédito', amount: 142000, type: 'Tarjeta de Crédito', tag: 'credito', description: 'Tarjeta principal', lastDigits: '4821', creditLimit: 500000, closingDay: 15 },
    { bank: 'BBVA', name: 'Tarjeta de Débito', amount: 98000, type: 'Tarjeta de Débito', tag: 'debito', description: 'Tarjeta para gastos diarios', lastDigits: '9012' },
  ];

  return (
    <>
      {accounts.length === 0 ? (
        <div className="account-card__no-accounts">
          <MessageInfo message="No hay cuentas registradas" />
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account, index) => (
            <Card
              cardTitle={account.name}
              cardDescription={account.bank}
              className="account-card"
              key={index}
              tag={{
                cardTag: account.tag ?? 'general',
                className: account.tag ? `tag-${account.tag}` : ''
              }}
            >
              <div>{getBodyContent(account)}</div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
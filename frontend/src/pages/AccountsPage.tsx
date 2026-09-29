import { BodyContent, BodyHeader, SelectionMenu } from '../components/layout';
import { BsInfoCircle } from 'react-icons/bs';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { ModalConfirm } from '../components/layout/modal/ModalConfirm';
import { useIsMobile } from '../hooks';
import { AccountDetails, AccountForm, AccountListItem } from '../modules/accounts';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import { useAccounts } from '../modules/accounts/hooks/useAccounts';
import { useEffect, useState } from 'react';

import "./accountsPage.css"

interface AccountsPageProps {
  section: string;
}

/**
 * AccountsPage Component
 * 
 * Main page for the Accounts section. Displays a master-detail layout where the user can 
 * view their list of accounts on the left, filter them, search them, and see detailed 
 * information on the right. Also allows opening a modal to create new accounts.
 * 
 * @param {AccountsPageProps} props - Component properties containing the active section name.
 * @returns {JSX.Element} The rendered Accounts page.
 */
export const AccountsPage = ({ section }: AccountsPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const { 
    accounts, 
    fetchAccounts,
    createAccount, 
    updateAccount,
    deactivateAccount,
    reactivateAccount,
    loading, 
    error, 
    clearError, 
    success, 
    clearSuccess 
  } = useAccounts();



  const [selectedAccountID, setSelectedAccountID] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Autoseleccionar la primer cuenta al cargar
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountID) {
      setSelectedAccountID(accounts[0].id);
    }
  }, [accounts, selectedAccountID]);

  const [isSuccessClosing, setIsSuccessClosing] = useState(false);

  /**
   * Maps an account type string to its corresponding tag.
   */
  const getTag = (accountType: string) => {
    switch (accountType) {
      case "Efectivo": return "efectivo";
      case "Billetera virtual": return "billetera";
      case "Caja de ahorro": return "ahorro";
      case "Cuenta corriente": return "corriente";
      case "Tarjeta de Crédito": return "crédito";
      default: return "billetera"; // Fallback por defecto
    }
  };

  /**
   * Handles the submission of the account creation form.
   * @param {any} formData - The data submitted from the account form.
   */
  const handleSubmitAccount = async (formData: any) => {
    // Asignar el tag correspondiente según el tipo elegido
    const finalData = { ...formData, tag: getTag(formData.type) };
    
    const isOk = await createAccount(finalData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'account-modal' });
        setIsSuccessClosing(false);
      }, 3000);
    }
  };

  /**
   * Handles the submission of the account update form.
   * @param {any} formData - The data submitted from the account form.
   */
  const handleUpdateAccount = async (formData: any) => {
    if (!selectedAccountID) return;
    const finalData = { ...formData, tag: getTag(formData.type) };
    
    const isOk = await updateAccount(selectedAccountID, finalData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'account-update-modal' });
        setIsSuccessClosing(false);
      }, 3000);
    }
  };

  /**
   * Filter and search the accounts list based on the active/inactive status 
   * and the search term entered by the user.
   */
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = acc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountID);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'hola'}
      email={user?.email || ''}
    >
      <BodyHeader 
        title="Cuentas" 
        description="Gestiona las distintas cuentas que vas a utilizar para asignar en tus transacciones."
        isMobile={isMobile}
        button={{
          label: 'Nueva cuenta',
          labelLoading: 'Agregando cuenta...',
          className: 'btn-add-account',
          onClick: () => { 
            clearError();
            clearSuccess();
            openModal({ idModal: 'account-modal' }); 
          },
          visible: true,
        }}
      />

      <BodyContent>
        <div className="master-detail-container">
          <div className="master-list-container">
            <div className="master-list-controls">
              <input 
                type="text" 
                placeholder="Buscar cuenta..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="account-search-input"
              />
              <select 
                className="account-filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'Active' | 'Inactive')}
              >
                <option value="Active">Activas</option>
                <option value="Inactive">Inactivas</option>
              </select>
            </div>
            {accounts.length === 0 && !loading ? (
              <div className="empty-accounts-message">
                <p>No tenés cuentas creadas.</p>
                <button className="link-btn" onClick={() => openModal({ idModal: 'account-modal' })}>
                  Crear una nueva cuenta
                </button>
              </div>
            ) : (
              <SelectionMenu
                className="master-list"
                items={filteredAccounts}
                isLoading={loading}
                emptyMessage="No se encontraron cuentas."
                keyExtractor={(acc) => acc.id!} // El ! es por si el id es opcional en la carga
                renderItem={(acc) => (
                  <AccountListItem 
                    account={acc} 
                    isSelected={acc.id === selectedAccountID}
                    onClick={() => setSelectedAccountID(acc.id!)}
                  />
                )}
              />
            )}
          </div>

          {/* COLUMNA DERECHA: Detalles */}
          <div className="detail-panel">
            {selectedAccount ? (
              <AccountDetails 
                account={selectedAccount} 
                onDeactivate={() => {
                  clearError();
                  clearSuccess();
                  openModal({ idModal: 'confirm-deactivate-modal' });
                }}
                onReactivate={() => {
                  clearError();
                  clearSuccess();
                  openModal({ idModal: 'confirm-reactivate-modal' });
                }}
                onEdit={() => {
                  clearError();
                  clearSuccess();
                  openModal({ idModal: 'account-update-modal' });
                }}
              />
            ) : (
              <div className="empty-detail">
                <p>Seleccioná una cuenta para ver sus detalles</p>
              </div>
            )}
          </div>

        </div>
      </BodyContent>
      
      {/* MODAL CREAR CUENTA */}
      <ModalPost
        title="Nueva Cuenta"
        id="account-modal"
        formId="account-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
      >
        <AccountForm
          onSubmit={handleSubmitAccount}
          loading={loading}
          errorMessage={error}
          successMessage={success}
          clearError={clearError}
          clearSuccess={clearSuccess}
          defaultValues={{ 
            bank: '',
            name: '', 
            type: '',
            amount: 0,
            description: '', 
            lastDigits: undefined,
            creditLimit: undefined,
            closingDay: undefined,
            dueDate: undefined
          }}
          modalId="account-modal"
          formId="account-form"
        />
      </ModalPost>

      {/* MODAL ACTUALIZAR CUENTA */}
      {selectedAccount && (
        <ModalPost
          title="Editar Cuenta"
          id="account-update-modal"
          formId="account-update-form"
          loading={loading || isSuccessClosing}
          clearError={clearError}
          clearSuccess={clearSuccess}
          buttonSubmit={{
            label: "Actualizar",
            labelLoading: "Actualizando...",
            className: "btn-submit-post",
            disabled: false,
            onClick: () => {},
          }}
        >
          <AccountForm
            key={selectedAccount.id} // Re-monta si cambia la cuenta para actualizar defaultValues
            onSubmit={handleUpdateAccount}
            loading={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            isEditing={true}
            defaultValues={{
              bank: selectedAccount.bank,
              name: selectedAccount.name,
              type: selectedAccount.type,
              amount: selectedAccount.amount ?? 0,
              description: selectedAccount.description || '',
              lastDigits: selectedAccount.lastDigits || '',
              creditLimit: selectedAccount.creditLimit || '',
              closingDay: selectedAccount.closingDay || '',
              dueDate: selectedAccount.dueDate || ''
            }}
            modalId="account-update-modal"
            formId="account-update-form"
          />
        </ModalPost>
      )}

      {/* MODALES DE CONFIRMACIÓN */}
      {selectedAccount && (
        <>
          <ModalConfirm
            id="confirm-deactivate-modal"
            title="Dar de baja cuenta"
            loading={loading || isSuccessClosing}
            isProcessing={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            buttonLabel="Dar de baja"
            buttonLabelLoading="Procesando..."
            confirmButtonClass="btn btn-danger"
            onConfirm={async () => {
              const ok = await deactivateAccount(selectedAccount.id!);
              if (ok) {
                setIsSuccessClosing(true);
                setTimeout(() => {
                  setSelectedAccountID(null);
                  closeModal({ idModal: 'confirm-deactivate-modal' });
                  setIsSuccessClosing(false);
                }, 3000);
              }
            }}
          >
            <p>¿Estás seguro de que querés dar de baja la cuenta <strong>{selectedAccount.name}</strong>?</p>
            <p className="text-muted mb-0 mt-1 d-flex align-items-center gap-3" style={{ fontSize: '0.9rem' }}>
              <BsInfoCircle size={16} />
              No podrás usarla en nuevas transacciones, pero mantendrá su historial.
            </p>
          </ModalConfirm>

          <ModalConfirm
            id="confirm-reactivate-modal"
            title="Reactivar cuenta"
            loading={loading || isSuccessClosing}
            isProcessing={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            buttonLabel="Reactivar"
            buttonLabelLoading="Procesando..."
            confirmButtonClass="btn btn-success"
            onConfirm={async () => {
              const ok = await reactivateAccount(selectedAccount.id!);
              if (ok) {
                setIsSuccessClosing(true);
                setTimeout(() => {
                  setSelectedAccountID(null);
                  closeModal({ idModal: 'confirm-reactivate-modal' });
                  setIsSuccessClosing(false);
                }, 3000);
              }
            }}
          >
            <p>¿Querés volver a activar la cuenta <strong>{selectedAccount.name}</strong> para usarla nuevamente en tus transacciones?</p>
          </ModalConfirm>
        </>
      )}

    </MainLayout>
  );
};
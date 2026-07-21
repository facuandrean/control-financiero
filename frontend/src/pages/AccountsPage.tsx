import { BodyContent, BodyHeader, SelectionMenu } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { useIsMobile } from '../hooks';
import { AccountForm } from '../modules/accounts';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import { useAccounts } from '../modules/accounts/hooks/useAccounts';

interface AccountsPageProps {
  section: string;
}

export const AccountsPage = ({ section }: AccountsPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  // 1. Instanciamos nuestro hook
  const { 
    accounts, 
    createAccount, 
    loading, 
    error, 
    clearError, 
    success, 
    clearSuccess 
  } = useAccounts();

  // 2. Pedimos las cuentas al cargar el componente
  // hay que arreglarlo porque lanza muchas ejecuciones
  // useEffect(() => {
  //   fetchAccounts();
  // }, [fetchAccounts]);

  // 3. Manejador del submit del formulario
  const handleSubmitAccount = async (formData: any) => {
    console.log('handleSubmitAccount formData:', formData);
    const isOk = await createAccount(formData);
    if (isOk) {
      // Cerramos el modal solo si el backend respondió con éxito
      closeModal({ idModal: 'account-modal' });
    }
  };

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
        <SelectionMenu>
          <div>Cuentas cargadas: {accounts.length}</div>
        </SelectionMenu>
      </BodyContent>
      
      <ModalPost
        title="Nueva Cuenta"
        id="account-modal"
        formId="account-form"
        loading={loading}
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

    </MainLayout>
  );
};
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { AccountCard, AccountForm } from '../modules/accounts';
import { useAuthStore } from '../store';

interface AccountsPageProps {
  section: string;
}

export const AccountsPage = ({ section }: AccountsPageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'hola'}
      email={user?.email || ''}
    >
      <BodyHeader 
        title="Cuentas" 
        description="Gestiona las formas de pago que vas a utilizar para tus transacciones"
        button={{
          label: 'Agregar cuenta',
          labelLoading: 'Agregando cuenta...',
          className: 'btn-add-account',
          onClick: () => { console.log('Agregar cuenta') },
          visible: true,
        }}
      />

      <BodyContent>
        <h2>Todas las cuentas</h2>
        <AccountCard />
      </BodyContent>
      
      <ModalPost
        title="Nueva Cuenta"
        formId="account-form"
        // loading={loading}
        buttonLabel="Guardar"
        buttonLabelLoading="Guardando..."
        id="account-modal"
      >
        <AccountForm
          onSubmit={() => {}}
          loading={false}
          errorMessage={''}
          successMessage={''}
          clearError={() => {}}
          clearSuccess={() => {}}
        />
      </ModalPost>

    </MainLayout>
  );
};
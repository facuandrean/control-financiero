import { useState } from 'react';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { AccountForm } from '../modules/accounts/components/AccountForm';
import { getUser } from '../utils/getInfoUserActive';

interface AccountsPageProps {
  section: string;
}

export const AccountsPage = ({ section }: AccountsPageProps) => {
  const { username, email } = getUser();

  return (
    <MainLayout 
      section={section}
      username={username}
      email={email}
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
        <span>No hay cuentas registradas</span>
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
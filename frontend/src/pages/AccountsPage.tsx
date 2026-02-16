import { FaPlus } from 'react-icons/fa6';
import { Button } from '../components';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
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
      >
        <Button
          className="btn-add-account"
          onClick={() => {console.log('Agregar cuenta')}}
        >
          <FaPlus size={14} className="btn-add-account__icon" />
          <span className="btn-add-account__text">Agregar cuenta</span>
        </Button>
      </BodyHeader>

      <BodyContent>
        <span>No hay cuentas registradas</span>
      </BodyContent>

      
    </MainLayout>
  );
};
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
      <div>
        <p>Cuentas</p>
      </div>
    </MainLayout>
  );
};
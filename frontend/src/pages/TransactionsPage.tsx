import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { getUser } from '../utils/getInfoUserActive';

interface TransactionsPageProps {
  section: string;
}

export const TransactionsPage = ({ section }: TransactionsPageProps) => {
  const { username, email } = getUser();

  return (
    <MainLayout 
      section={section}
      username={username}
      email={email}
    >
      <div>
        <p>Transacciones</p>
      </div>
    </MainLayout>
  );
};
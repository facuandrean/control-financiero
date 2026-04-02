import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { useAuthStore } from '../store/authStore';

interface TransactionsPageProps {
  section: string;
}

export const TransactionsPage = ({ section }: TransactionsPageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || 'Email del usuario'}
    >
      <div>
        <p>Transacciones</p>
      </div>
    </MainLayout>
  );
};
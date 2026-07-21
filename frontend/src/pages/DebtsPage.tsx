import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { useAuthStore } from '../store/authStore';

interface DebtsPageProps {
  section: string;
}

export const DebtsPage = ({ section }: DebtsPageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || 'Email del usuario'}
    >
      <div>
        <p>Deudas</p>
      </div>
    </MainLayout>
  );
};
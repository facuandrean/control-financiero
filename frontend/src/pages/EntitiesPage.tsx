import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { useAuthStore } from '../store/authStore';

interface EntitiesPageProps {
  section: string;
}

export const EntitiesPage = ({ section }: EntitiesPageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || 'Email del usuario'}
    >
      <div>
        <p>Entidades</p>
      </div>
    </MainLayout>
  );
};
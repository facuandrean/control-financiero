import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { useAuthStore } from '../store/authStore';

interface HomePageProps {
  section: string;
}

export const HomePage = ({ section }: HomePageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || 'Email del usuario'}
    >
      <div>
        <h1>Hola, {user?.name || 'Usuario'}!</h1>
        <p>Este es el estado de tus finanzas hoy</p>
      </div>
    </MainLayout>
  );
};
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { useAuthStore } from '../store/authStore';

interface CategoriesPageProps {
  section: string;
}

export const CategoriesPage = ({ section }: CategoriesPageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <MainLayout 
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || 'Email del usuario'}
    >
      <div>
        <p>Categorías</p>
      </div>
    </MainLayout>
  );
};
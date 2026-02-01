import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { getUser } from '../utils/getInfoUserActive';

interface CategoriesPageProps {
  section: string;
}

export const CategoriesPage = ({ section }: CategoriesPageProps) => {
  const { username, email } = getUser();

  return (
    <MainLayout 
      section={section}
      username={username}
      email={email}
    >
      <div>
        <p>Categorías</p>
      </div>
    </MainLayout>
  );
};
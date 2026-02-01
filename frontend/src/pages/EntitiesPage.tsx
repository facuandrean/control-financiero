import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { getUser } from '../utils/getInfoUserActive';

interface EntitiesPageProps {
  section: string;
}

export const EntitiesPage = ({ section }: EntitiesPageProps) => {
  const { username, email } = getUser();

  return (
    <MainLayout 
      section={section}
      username={username}
      email={email}
    >
      <div>
        <p>Entidades</p>
      </div>
    </MainLayout>
  );
};
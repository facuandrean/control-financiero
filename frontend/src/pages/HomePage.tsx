import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { getUser } from '../utils/getInfoUserActive';

interface HomePageProps {
  section: string;
}

export const HomePage = ({ section }: HomePageProps) => {
  const { username, email } = getUser();

  return (
    <MainLayout 
      section={section}
      username={username}
      email={email}
    >
      <div>
        <h1>Hola, {username}!</h1>
        <p>Este es el estado de tus finanzas hoy</p>
      </div>
    </MainLayout>
  );
};
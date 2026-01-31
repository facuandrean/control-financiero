import { MainLayout } from '../components/layout/mainLayout/MainLayout';

interface HomePageProps {
  section: string;
}

export const HomePage = ({ section }: HomePageProps) => {
  return (
    <MainLayout section={section}>
      <header className="page-header">
        <h1>Hola, Facu!</h1>
        <p>Este es el estado de tus finanzas hoy.</p>
      </header>
    </MainLayout>
  );
};
import { DashboardPage } from './DashboardPage';

interface HomePageProps {
  section: string;
}

export const HomePage = ({ section }: HomePageProps) => {
  return <DashboardPage section={section} />;
};
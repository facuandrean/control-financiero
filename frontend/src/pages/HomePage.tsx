import { Header, Sidebar } from '../components';

interface HomePageProps {
  section: string;
}

export const HomePage = ({ section }: HomePageProps) => {
  return (
    <>
      <Sidebar />
      <Header section={section} />
    </>
  )
}
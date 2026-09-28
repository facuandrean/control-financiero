import { Container } from "../container/Container";
import { Sidebar } from "../sidebar/Sidebar";
import { useAuthStore } from "../../../store";

export const Home = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <Sidebar isOpen={true} username={user?.name || "Usuario"} email={user?.email || ""} />
      <Container>
        <h1>Home</h1>
      </Container>
    </>
  );
};
import { Container } from "../container/Container"
import { Sidebar } from "../sidebar/Sidebar"

export const Home = () => {
  return (
    <>
      <Sidebar />
      <Container>
        <h1>Home</h1>
      </Container>
    </>
  )
}
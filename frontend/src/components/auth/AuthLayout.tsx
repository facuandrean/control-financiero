import type { ReactNode } from 'react';
import { Container } from '../layout';
import { Card } from '../layout/card/Card';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Container className="auth-container">
      <Card className="auth-card">
        {children}
      </Card>
    </Container>
  );
};
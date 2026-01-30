import type { ReactNode } from 'react';
import { Container } from '../layout';
import { Card } from '../layout/card/Card';

interface AuthLayoutProps {
  cardProps: {
    cardTitle: string;
    cardDescription: string;
  }
  children: ReactNode;
}

export const AuthLayout = ({ cardProps, children }: AuthLayoutProps) => {
  return (
    <Container className="auth-container">
      <Card 
        className="auth-card" 
        cardTitle={cardProps.cardTitle} 
        cardDescription={cardProps.cardDescription}
      >
        {children}
      </Card>
    </Container>
  );
};
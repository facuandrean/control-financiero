import { useLogin } from '../hooks/useLogin';

import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { Stamp } from '../components/layout/stamp/Stamp';

export const LoginPage = () => {
  // Usamos el hook para obtener la lógica
  const { login, loading, error, setError } = useLogin();

  return (
    <AuthLayout
      cardProps={{
        cardTitle: 'Iniciar sesión',
        cardDescription: 'Ingresa tus credenciales para acceder a tu cuenta'
      }}
    >
      <Stamp />
      <LoginForm 
        onSubmit={login} 
        loading={loading} 
        errorMessage={error || ''} 
        clearError={() => setError(null)} 
      />
    </AuthLayout>
  );
};
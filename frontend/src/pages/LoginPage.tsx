import { useLogin } from '../hooks/useLogin';

import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  // Usamos el hook para obtener la lógica
  const { login, loading, error, setError } = useLogin();

  return (
    <AuthLayout>
      <LoginForm 
        onSubmit={login} 
        loading={loading} 
        errorMessage={error || ''} 
        clearError={() => setError(null)} 
      />
    </AuthLayout>
  );
};
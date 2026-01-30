import { useRegister } from '../hooks';

import { AuthLayout, RegisterForm } from '../components';

export const RegisterPage = () => {
  // Usamos el hook para obtener la lógica
  const { register, loading, error, setError } = useRegister();

  return (
    <AuthLayout>
      <RegisterForm 
        onSubmit={register} 
        loading={loading} 
        errorMessage={error || ''} 
        clearError={() => setError(null)} 
      />
    </AuthLayout>
  );
};
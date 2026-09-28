import { GoogleLogin } from '@react-oauth/google';
import { useLogin, useGoogleAuth } from '../hooks';

import { AuthLayout, LoginForm, MessageError } from '../components';
import { Stamp } from '../components/layout/stamp/Stamp';

export const LoginPage = () => {
  const { login, loading, error, setError } = useLogin();
  const { onGoogleSuccess, onGoogleError, googleError } = useGoogleAuth();

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

      <div className="auth-divider">
        <span>O continuar con</span>
      </div>

      <div className="google-auth-container">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          text="signin_with"
          shape="rectangular"
          theme="outline"
          size="large"
          width="100%"
        />
      </div>

      {googleError && (
        <MessageError 
          message={googleError} 
          className="mt-2 text-center" 
        />
      )}
    </AuthLayout>
  );
};
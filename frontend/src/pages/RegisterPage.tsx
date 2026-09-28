import { GoogleLogin } from '@react-oauth/google';
import { useRegister, useGoogleAuth } from '../hooks';

import { AuthLayout, RegisterForm, MessageError } from '../components';
import { Stamp } from '../components/layout/stamp/Stamp';

export const RegisterPage = () => {
  const { register, loading, error, setError } = useRegister();
  const { onGoogleSuccess, onGoogleError, googleError } = useGoogleAuth();

  return (
    <AuthLayout
      cardProps={{
        cardTitle: 'Crear cuenta',
        cardDescription: 'Crea una cuenta para acceder a tu panel de control'
      }}
    >
      <Stamp />
      <RegisterForm 
        onSubmit={register} 
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
          text="signup_with"
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
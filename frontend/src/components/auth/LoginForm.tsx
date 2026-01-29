import { Link } from "react-router-dom";
import { Form } from "../ui/form/Form";
import { Input } from "../ui/inputs/Input";

interface LoginFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  errorMessage?: string;
  clearError: () => void;
}

export const LoginForm = ({ onSubmit, loading, errorMessage, clearError }: LoginFormProps) => {
  return (
    <>
      <Form 
        onSubmit={onSubmit} 
        loading={loading} 
        errorMessage={errorMessage}
        clearError={clearError}
      >
        {({ control, errors }) => (
          <>
            <Input 
              formID="auth-login" 
              name="email" 
              label="E-mail" 
              control={control} 
              rules={{ 
                required: "El e-mail es obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Formato de e-mail inválido" }
              }} 
              errors={errors} 
              type="email" 
              placeholder="example@example.com"
            />
            <Input 
              formID="auth-login" 
              name="password" 
              label="Contraseña" 
              control={control} 
              rules={{ 
                required: "La contraseña es obligatoria",
              }} 
              errors={errors} 
              type="password" 
              placeholder="********"
            />
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <div className="text-center mt-3">
              <Link to="/auth/register">¿No tienes una cuenta? Regístrate</Link>
            </div>
          </>
        )}
      </Form>
    </>
  );
};
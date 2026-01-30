import { Link } from "react-router-dom";
import { Form } from "../ui/form/Form";
import { Input } from "../ui/inputs/Input";

interface RegisterFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  errorMessage?: string;
  clearError: () => void;
}

export const RegisterForm = ({ onSubmit, loading, errorMessage, clearError }: RegisterFormProps) => {
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
              formID="auth-register" 
              name="name" 
              label="Nombre" 
              control={control} 
              rules={{ 
                required: "El nombre es obligatorio",
                minLength: { value: 3, message: "El nombre debe tener al menos 3 caracteres" }
              }} 
              errors={errors} 
              type="text" 
              placeholder="Juan"
            />
            <Input 
              formID="auth-register" 
              name="lastName" 
              label="Apellido" 
              control={control} 
              rules={{ 
                required: "El apellido es obligatorio",
                minLength: { value: 3, message: "El apellido debe tener al menos 3 caracteres" }
              }} 
              errors={errors} 
              type="text" 
              placeholder="Perez"
            />
            <Input 
              formID="auth-register" 
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
              formID="auth-register" 
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
              {loading ? "Registrando usuario..." : "Registrarse"}
            </button>

            <div className="text-center mt-3">
              <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
            </div>
          </>
        )}
      </Form>
    </>
  );
};
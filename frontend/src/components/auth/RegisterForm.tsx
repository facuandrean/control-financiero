import { Link } from "react-router-dom";
import { Form, Input, Button } from "../ui";

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
                required: "La contraseña es obligatoria.",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres."
                },
                validate: {
                  hasLowerCase: (value) =>
                    /[a-z]/.test(value) ||
                    "La contraseña debe contener al menos una letra minúscula.",
                  hasUpperCase: (value) =>
                    /[A-Z]/.test(value) ||
                    "La contraseña debe contener al menos una letra mayúscula.",
                  hasNumber: (value) =>
                    /[0-9]/.test(value) ||
                    "La contraseña debe contener al menos un número.",
                  hasSpecialChar: (value) =>
                    /[!@#$%^&*()_+\-={};':"\\|,.<>/?]/.test(value) ||
                    "La contraseña debe contener al menos un carácter especial."
                }
              }} 
              errors={errors} 
              type="password" 
              placeholder="********"
              infoProps={{
                content: (
                  <>
                    <p style={{ fontWeight: '600' }}>La contraseña debe tener al menos:</p>
                    <ul>
                      <li>8 caracteres</li>
                      <li>Una letra mayúscula</li>
                      <li>Una letra minúscula</li>
                      <li>Un número</li>
                      <li>Un carácter especial</li>
                    </ul>
                  </>
                ),
                position: 'top-left'
              }}
            />

            <Button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <div className="redirection-link text-center mt-3">
              <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
            </div>
          </>
        )}
      </Form>
    </>
  );
};
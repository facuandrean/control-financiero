import { useForm, type Control, type FieldErrors } from "react-hook-form";

import { Loading } from "../loading/Loading";
import { MessageSuccess } from "../messages/MessageSuccess";
import { MessageError } from "../messages/MessageError";

import { useClear } from "../../../hooks";

import './form.css';

interface FormProps {
  children: (props: { control: Control<any>, errors: FieldErrors<any> }) => React.ReactNode; // Es una funcion que recibe el control y los errores y devuelve un componente con los inputs del formulario
  onSubmit: (data: any) => void;
  
  loading?: boolean; // Es una propiedad que viene del padre porque el padre es quien maneja el estado de carga debido a que es el que hace la peticion al backend

  successMessage?: string;
  errorMessage?: string;
  clearError: () => void;
}

export const Form = ({
  children,
  onSubmit,
  loading,
  successMessage,
  errorMessage,
  clearError
}: FormProps) => {

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onSubmit" });

  useClear({ errorMessage, clearError });

  return (
    <>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        {children({ control, errors })}
      </form>

      {loading && (
        <div className="d-flex justify-content-center mt-3">
          <Loading />
        </div>
      )}

      {successMessage && (
        <MessageSuccess message={successMessage} className="mt-3" />
      )}

      {errorMessage && (
        <MessageError message={errorMessage} className="mt-3" />
      )}
    </>
  );
};
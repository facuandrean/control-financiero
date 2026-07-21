import { useEffect } from "react";
import { useForm, type Control, type FieldErrors } from "react-hook-form";

import { Loading } from "../loading/Loading";
import { MessageSuccess } from "../messages/MessageSuccess";
import { MessageError } from "../messages/MessageError";

import { useClear } from "../../../hooks";
import { onModalHidden } from "../../../utils/modal.utils";

import './form.css';

interface FormProps {
  children: (props: { control: Control<any>, errors: FieldErrors<any> }) => React.ReactNode;
  onSubmit: (data: any) => void;
  
  loading?: boolean; // Es una propiedad que viene del padre porque el padre es quien maneja el estado de carga debido a que es el que hace la peticion al backend

  successMessage?: string;
  errorMessage?: string;
  clearError?: () => void;
  clearSuccess?: () => void;

  defaultValues?: Record<string, any>;
  modalId?: string;

  formId?: string;
}

export const Form = ({
  children,
  onSubmit,
  loading,
  successMessage,
  errorMessage,
  clearError,
  clearSuccess,
  defaultValues = {},
  modalId,
  formId
}: FormProps) => {

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ mode: "onSubmit", defaultValues });

  useEffect(() => {
    if (!modalId) return;
    return onModalHidden(modalId, () => reset(defaultValues));
  }, [modalId]);

  useClear({ message: errorMessage, clearMessage: clearError ?? (() => {}) });
  useClear({ message: successMessage, clearMessage: clearSuccess ?? (() => {}) });

  return (
    <>
      <form id={formId} className="form" onSubmit={handleSubmit(onSubmit)}>
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
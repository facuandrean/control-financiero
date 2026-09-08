
import { Form, Input } from '../../../components/ui';

interface CategoryFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  defaultValues?: any;
  modalId: string;
  formId: string;
}

export const CategoryForm = ({
  onSubmit,
  loading,
  errorMessage,
  successMessage,
  clearError,
  clearSuccess,
  defaultValues,
  modalId,
  formId
}: CategoryFormProps) => {

  return (
    <Form
      formId={formId}
      onSubmit={onSubmit}
      loading={loading}
      errorMessage={errorMessage}
      successMessage={successMessage}
      clearError={clearError}
      clearSuccess={clearSuccess}
      modalId={modalId}
      defaultValues={defaultValues || { name: '', description: '' }}
    >
      {({ control, errors }) => (
        <>
          <Input
            formID={formId}
            label="Nombre de la categoría"
            type="text"
            name="name"
            control={control}
            rules={{ 
              required: "El nombre es obligatorio",
              minLength: { value: 3, message: "Debe tener al menos 3 caracteres" }
            }}
            errors={errors}
            placeholder="Ej: Sueldo, Supermercado, Alquiler..."
          />

          <Input
            formID={formId}
            label="Descripción (opcional)"
            type="text"
            name="description"
            control={control}
            rules={{
              maxLength: { value: 255, message: "La descripción no puede superar los 255 caracteres" }
            }}
            errors={errors}
            placeholder="Una breve descripción..."
          />
        </>
      )}
    </Form>
  );
};

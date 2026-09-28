import { useWatch } from "react-hook-form";
import { Form } from "../../../components/ui/form/Form";
import { Input } from "../../../components/ui/inputs/Input";
import { Select } from "../../../components/ui/inputs/Select";
import { Textarea } from "../../../components/ui/inputs/Textarea";
import { ACCOUNT_TYPES } from "../../../types/account.types";

/**
 * Props for the AccountForm component.
 */
interface AccountFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
  defaultValues?: any;
  modalId: string;
  formId: string;
  isEditing?: boolean;
}

/**
 * AccountForm Component
 * 
 * A versatile form component for creating or editing accounts.
 * It dynamically renders fields based on the selected account type.
 * For example, credit limit and due dates are only shown for Credit Cards.
 * 
 * @param {AccountFormProps} props - The component props.
 * @returns {JSX.Element} The rendered form component.
 */
export const AccountForm = ({ 
  onSubmit, 
  loading, 
  errorMessage, 
  successMessage, 
  clearError, 
  clearSuccess, 
  defaultValues, 
  modalId,
  formId,
  isEditing = false
}: AccountFormProps) => {
  const handleFormSubmit = async (formData: any) => {
    if (isEditing) {
      const { amount, ...rest } = formData;
      await onSubmit(rest);
    } else {
      await onSubmit(formData);
    }
  };

  return (
    <Form 
      onSubmit={handleFormSubmit} 
      loading={loading} 
      errorMessage={errorMessage}
      successMessage={successMessage}
      clearError={clearError}
      clearSuccess={clearSuccess}
      defaultValues={defaultValues}
      modalId={modalId}
      formId={formId}
    >
      {({ control, errors }) => {
        // Watch the type field to dynamically show/hide inputs
        const type = useWatch({ control, name: "type" });
        
        const isCreditCard = type === "Tarjeta de Crédito";
        const isCash = type === "Efectivo";
        
        // Any account that isn't cash can optionally have last digits
        const canHaveLastDigits = !isCash && !!type; 

        return (
          <>

            <Input 
              formID={formId}
              name="bank"
              label="Banco / Entidad"
              placeholder="Ej: Santander, Mercado Pago, Efectivo"
              control={control}
              rules={{ required: "El banco es obligatorio" }}
              errors={errors}
              type="text"
            />

            <Input 
              formID={formId}
              name="name"
              label="Nombre identificatorio"
              placeholder="Ej: Sueldo Santander, Tarjeta Visa, MP Principal"
              control={control}
              rules={{ required: "El nombre es obligatorio" }}
              errors={errors}
              type="text"
            />
            
            <Select 
              formID={formId}
              name="type"
              label="Tipo de cuenta"
              placeholder="Seleccioná un tipo..."
              control={control}
              rules={{ required: "Debés seleccionar un tipo de cuenta" }}
              errors={errors}
              options={ACCOUNT_TYPES}
            />

            {!isEditing && (
              <Input 
                formID={formId}
                name="amount"
                label={isCreditCard ? "Monto gastado actual / Deuda inicial" : "Saldo / Monto Inicial"}
                placeholder="0"
                control={control}
                errors={errors}
                type="number"
              />
            )}

            {canHaveLastDigits && (
              <Input 
                formID={formId}
                name="lastDigits"
                label="Últimos 4 dígitos de la tarjeta (Opcional)"
                placeholder="1234"
                control={control}
                errors={errors}
                type="text"
                rules={{ 
                  maxLength: { value: 4, message: "Máximo 4 dígitos" },
                }}
              />
            )}

            {isCreditCard && (
              <>
                <Input 
                  formID={formId}
                  name="creditLimit"
                  label="Límite de crédito asignado por el banco"
                  placeholder="Ej: 850000"
                  control={control}
                  errors={errors}
                  type="number"
                />
                
                <Input 
                  formID={formId}
                  name="closingDay"
                  label="Día del mes que cierra la tarjeta"
                  placeholder="Ej: 25"
                  control={control}
                  errors={errors}
                  type="number"
                  rules={{ 
                    min: { value: 1, message: "Día entre 1 y 31" },
                    max: { value: 31, message: "Día entre 1 y 31" },
                  }}
                />

                <Input 
                  formID={formId}
                  name="dueDate"
                  label="Día del mes que vence el resumen"
                  placeholder="Ej: 5"
                  control={control}
                  errors={errors}
                  type="number"
                  rules={{ 
                    min: { value: 1, message: "Día entre 1 y 31" },
                    max: { value: 31, message: "Día entre 1 y 31" },
                  }}
                />
              </>
            )}

            <Textarea
              formID={formId}
              name="description"
              label="Descripción / Notas (Opcional)"
              placeholder="Ej: Tarjeta de crédito del Santander para compras en cuotas"
              control={control}
              errors={errors}
            />
          </>
        );
      }}
    </Form>
  );
};
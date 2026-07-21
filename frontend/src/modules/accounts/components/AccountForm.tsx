import { Controller, useWatch } from "react-hook-form";
import { Form } from "../../../components/ui/form/Form";
import { Input } from "../../../components/ui/inputs/Input";
import { Select } from "../../../components/ui/inputs/Select";
import { Textarea } from "../../../components/ui/inputs/Textarea";
import { ACCOUNT_TYPES } from "../../../types/account.types";

export const AccountForm = ({ 
  onSubmit, 
  loading, 
  errorMessage, 
  successMessage, 
  clearError, 
  clearSuccess, 
  defaultValues, 
  modalId,
  formId
}: any) => {
  return (
    <Form 
      onSubmit={onSubmit} 
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
        const type = useWatch({ control, name: "type" });
        
        const isCreditCard = type === "Tarjeta de Crédito";
        const isCash = type === "Efectivo";
        // Cualquier cuenta que no sea efectivo puede tener últimos 4 dígitos
        const canHaveLastDigits = !isCash && !!type; 

        const getTag = (accountType: string) => {
          switch (accountType) {
            case "Efectivo": return "efectivo";
            case "Billetera virtual": return "billetera";
            case "Caja de ahorro": return "ahorro";
            case "Cuenta corriente": return "corriente";
            case "Tarjeta de Crédito": return "crédito";
            default: return "";
          }
        };

        const currentTag = getTag(type ?? "");

        return (
          <>
            <Controller
              name="tag"
              control={control}
              defaultValue={currentTag}
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                  value={currentTag}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              )}
            />

            <Input 
              formID="account-form"
              name="bank"
              label="Banco / Entidad"
              placeholder="Ej: Santander, Mercado Pago, Efectivo"
              control={control}
              rules={{ required: "El banco es obligatorio" }}
              errors={errors}
              type="text"
            />

            <Input 
              formID="account-form"
              name="name"
              label="Nombre identificatorio"
              placeholder="Ej: Sueldo Santander, Tarjeta Visa, MP Principal"
              control={control}
              rules={{ required: "El nombre es obligatorio" }}
              errors={errors}
              type="text"
            />
            
            <Select 
              formID="account-form"
              name="type"
              label="Tipo de cuenta"
              placeholder="Seleccioná un tipo..."
              control={control}
              rules={{ required: "Debés seleccionar un tipo de cuenta" }}
              errors={errors}
              options={ACCOUNT_TYPES}
            />

            <Input 
              formID="account-form"
              name="amount"
              label={isCreditCard ? "Monto gastado actual / Deuda inicial" : "Saldo / Monto Inicial"}
              placeholder="0"
              control={control}
              errors={errors}
              type="number"
            />

            {canHaveLastDigits && (
              <Input 
                formID="account-form"
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
                  formID="account-form"
                  name="creditLimit"
                  label="Límite de crédito asignado por el banco"
                  placeholder="Ej: 850000"
                  control={control}
                  errors={errors}
                  type="number"
                />
                
                <Input 
                  formID="account-form"
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
                  formID="account-form"
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
              formID="account-form"
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
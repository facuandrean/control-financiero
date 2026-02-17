import { useWatch } from "react-hook-form";
import { Form } from "../../../components/ui/form/Form";
import { Input } from "../../../components/ui/inputs/Input";
import { Select } from "../../../components/ui/inputs/Select";

const ACCOUNT_TYPES = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Billetera Virtual", label: "Billetera Virtual (MP, Lemon, etc)" },
  { value: "Caja de Ahorro", label: "Caja de Ahorro / Banco" },
  { value: "Tarjeta de Crédito", label: "Tarjeta de Crédito" },
  { value: "Tarjeta de Débito", label: "Tarjeta de Débito" },
];

export const AccountForm = ({ onSubmit, loading, errorMessage, successMessage, clearError, clearSuccess }: any) => {
  return (
    <Form 
      onSubmit={onSubmit} 
      loading={loading} 
      errorMessage={errorMessage}
      successMessage={successMessage}
      clearError={clearError}
      clearSuccess={clearSuccess}
    >
      {({ control, errors }) => {
        const type = useWatch({ control, name: "type" });
        const isCreditCard = type === "Tarjeta de Crédito";
        const isDebitCard = type === "Tarjeta de Débito";
        const isCard = isCreditCard || isDebitCard;

        return (
          <>
            <Input 
              formID="account-form"
              name="name"
              label="Nombre de la cuenta"
              placeholder="Ej: Santander o Mercado Pago"
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
              name="lastDigits"
              label="Últimos 4 números"
              placeholder="1234"
              control={control}
              errors={errors}
              type="text"
              disabled={!isCard}
              rules={{ 
                maxLength: { value: 4, message: "Máximo 4 dígitos" },
                required: isCard ? "Los últimos 4 dígitos son obligatorios para tarjetas" : false
              }}
            />

            <button type="submit" className="btn btn-success w-100 mt-2" disabled={loading}>
              {loading ? "Cargando..." : "Crear Cuenta"}
            </button>
          </>
        );
      }}
    </Form>
  );
};
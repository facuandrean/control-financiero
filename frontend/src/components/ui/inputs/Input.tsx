import { Controller, type Control, type FieldErrors, type RegisterOptions } from "react-hook-form";

interface InputProps {
  formID: string;
  name: string;
  label: string;
  control: Control<any>;
  rules: RegisterOptions<any>;
  errors: FieldErrors<any>;
  type: string;
  placeholder?: string;
  disabled?: boolean;
}

export const Input = ({ formID, name, label, control, rules, errors, type, placeholder, disabled }: InputProps) => {
  const inputID = formID ? `${formID}-${name}` : name;

  return (
    <div className="form-group mb-3">
      <label htmlFor={inputID} className="form-label">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          let controlEl = (
            <input 
              id={inputID}
              type={type}
              {...field}
              value={field.value || ''}
              className={`form-control ${errors[name] ? "is-invalid" : ""}`}
              placeholder={placeholder}
              disabled={disabled}
            />
          )

          return controlEl;
        }}
      />
      {errors[name] && 
        <div className="invalid-feedback d-block">
          {errors[name]?.message?.toString()}
        </div>
      }
    </div>
  );
};

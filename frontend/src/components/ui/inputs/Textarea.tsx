import { Controller, type Control, type FieldErrors, type RegisterOptions } from "react-hook-form";

import './textarea.css';

interface TextareaProps {
  formID: string;
  name: string;
  label: string;
  control: Control<any>;
  rules?: RegisterOptions<any>;
  errors: FieldErrors<any>;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export const Textarea = ({
  formID,
  name,
  label,
  control,
  rules,
  errors,
  placeholder,
  disabled,
  rows = 4,
}: TextareaProps) => {
  const inputID = formID ? `${formID}-${name}` : name;

  return (
    <div className="form-group mb-3">
      <label htmlFor={inputID} className="form-label">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <textarea
            id={inputID}
            {...field}
            value={field.value || ''}
            className={`form-control textarea-control ${errors[name] ? "is-invalid" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
          />
        )}
      />
      {errors[name] && (
        <div className="invalid-feedback d-block">
          {errors[name]?.message?.toString() || "Campo requerido"}
        </div>
      )}
    </div>
  );
};

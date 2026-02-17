import { Controller, type Control, type FieldErrors, type RegisterOptions } from "react-hook-form";

import './select.css';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  formID: string;
  name: string;
  label: string;
  control: Control<any>;
  rules?: RegisterOptions<any>;
  errors: FieldErrors<any>;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

export const Select = ({ 
  formID, 
  name, 
  label, 
  control, 
  rules, 
  errors, 
  options, 
  placeholder, 
  disabled 
}: SelectProps) => {
  const inputID = formID ? `${formID}-${name}` : name;

  return (
    <div className="form-group mb-3">
      <label htmlFor={inputID} className="form-label">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <select
            id={inputID}
            {...field}
            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
            disabled={disabled}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
import { useState } from "react";
import { Controller, type Control, type FieldErrors, type RegisterOptions } from "react-hook-form";
import { PasswordToggle } from "../button/PasswordToggle";
import { ButtonInfo } from "../button/ButtonInfo";

import './input.css';

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
  infoProps?: {
    content: React.ReactNode;
    position: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'top-left';
  };
}

export const Input = ({ 
  formID, 
  name, 
  label, 
  control, 
  rules, 
  errors, 
  type, 
  placeholder, 
  disabled,
  infoProps,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputID = formID ? `${formID}-${name}` : name;
  const isPassword = type === 'password';

  return (
    <div className="form-group mb-3">
      <label htmlFor={inputID} className="form-label">{label}</label>
      <div className="input-wrapper">
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => {
            let controlEl = (
              <input 
                id={inputID}
                type={isPassword && showPassword ? 'text' : type}
                {...field}
                value={field.value || ''}
                className={`form-control 
                  ${!infoProps?.content && isPassword ? "input-without-info" : ""}
                  ${isPassword ? "input-password" : ""} 
                  ${errors[name] ? "is-invalid" : ""}`
                }
                placeholder={placeholder}
                disabled={disabled}
              />
            )

            return controlEl;
          }}
        />

        {isPassword && (
          <PasswordToggle 
            showPassword={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        )}

        {isPassword && infoProps?.content && (
          <ButtonInfo 
            content={infoProps?.content}
            position={infoProps?.position}
            hasError={!!errors[name]}
          />
        )}

      </div>
      
      {errors[name] && 
        <div className="invalid-feedback d-block">
          {errors[name]?.message?.toString()}
        </div>
      }
    </div>
  );
};

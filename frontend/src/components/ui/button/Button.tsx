import './button.css';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = ({ 
  children, 
  className, 
  onClick, 
  disabled, 
  type 
}: ButtonProps) => {
  return (
    <button className={className || ''} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  )
}
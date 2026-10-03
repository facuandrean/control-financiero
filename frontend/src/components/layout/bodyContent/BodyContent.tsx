import './body-content.css';

interface BodyContentProps {
  children: React.ReactNode;
  className?: string;
}

export const BodyContent = ({ children, className }: BodyContentProps) => {
  return (
    <div className={`body-content-wrapper${className ? ` ${className}` : ''}`}>
      <div className="body-content">
        {children}
      </div>
    </div>
  )
}
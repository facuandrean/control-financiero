import './body-header.css';

interface BodyHeaderProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const BodyHeader = ({ 
  title, 
  description, 
  children 
}: BodyHeaderProps) => {
  return (
    <div className="body-header">
      <h1 className="body-header__title">{title}</h1>
      <p className="body-header__description">{description}</p>

      {children}
    </div>
  )
}
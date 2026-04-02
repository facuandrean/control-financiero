import './Card.css';

interface CardProps {
  className?: string;
  cardTitle: string;
  cardDescription: string;
  children: React.ReactNode;
}

export const Card = ({ className, cardTitle, cardDescription, children }: CardProps) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title">{cardTitle}</h3>
        <p className="card-description">{cardDescription}</p>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}
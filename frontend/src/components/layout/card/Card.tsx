import './Card.css';

interface CardProps {
  className?: string;
  cardTitle: string;
  cardDescription: string;
  tag?: {
    className: string;
    cardTag: string;
  };
  children: React.ReactNode;
}

export const Card = ({ className, cardTitle, cardDescription, tag, children }: CardProps) => {
  return (
    <div className={`card ${className ? ` ${className}` : ''}`}>
      <div className="card-header">
        <div className="card-header-categories">
          <p className="card-description">{cardDescription}</p>
          {tag && <span className={`card-tag ${tag.className}`}>{tag.cardTag}</span>}
        </div>
        <h3 className="card-title">{cardTitle}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}
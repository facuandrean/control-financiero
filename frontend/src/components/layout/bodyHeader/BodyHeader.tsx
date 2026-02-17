import { FaPlus } from 'react-icons/fa';
import { Button } from '../..';

import './body-header.css';

interface BodyHeaderProps {
  title: string;
  description: string;
  button: {
    label: string;
    labelLoading: string;
    className: string;
    onClick: () => void;
    visible: boolean;
  };
}

export const BodyHeader = ({ 
  title, 
  description, 
  button = {
    label: 'Registrar',
    labelLoading: 'Registrando...',
    className: 'btn-add-account',
    onClick: () => {},
    visible: false,
  },
}: BodyHeaderProps) => {
  return (
    <div className="body-header">
      <h1 className="body-header__title">{title}</h1>
      <p className="body-header__description">{description}</p>
      {button.visible && (
        <Button
          className={button.className}
          onClick={button.onClick}
        >
          <FaPlus size={14} className={`${button.className}__icon`} />
          <span className={`${button.className}__text`}>{button.label}</span>
        </Button>
      )}
    </div>
  )
}
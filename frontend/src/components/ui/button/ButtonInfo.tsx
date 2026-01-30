import { useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ToolTip } from '../tooltip/ToolTip';
import './button-info.css';

interface ButtonInfoProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'top-left';
  hasError?: boolean;
}

export const ButtonInfo = ({ 
  content, 
  position = 'right',
  hasError = false
}: ButtonInfoProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div className="button-info-wrapper">
      <button
        type="button"
        className={`button-info ${hasError ? 'button-info--with-error' : ''}`}
        onClick={handleToggle}
        aria-label="Mostrar información"
      >
        <AiOutlineInfoCircle size={18} />
      </button>
      <ToolTip position={position} show={showTooltip}>
        {content}
      </ToolTip>
    </div>
  );
};

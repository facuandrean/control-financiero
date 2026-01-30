import './tooltip.css';

interface ToolTipProps {
  children: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'top-left';
  show?: boolean;
}

export const ToolTip = ({ children, position, show = true }: ToolTipProps) => {
  return (
    <div className={`tooltip ${position} ${show ? 'show' : ''}`}>
      {children}
    </div>
  )
}
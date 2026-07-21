import "./optionSelectionMenu.css"

interface OptionSelectionMenuProps {
  children: React.ReactNode;
}

export const OptionSelectionMenu = ({ children }: OptionSelectionMenuProps) => {
  return (
    <div className="option-selection-menu">
        {children}
    </div>
    );
}
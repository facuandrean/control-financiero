import "./selectionMenu.css";

interface SelectionMenuProps {
    children: React.ReactNode;
}

export const SelectionMenu = ({ children }: SelectionMenuProps) => {
    return (
        <div className="selection-menu">
            {children}
        </div>
    );
};
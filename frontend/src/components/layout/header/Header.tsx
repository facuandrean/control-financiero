import { Button } from '../../ui';
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpand } from 'react-icons/tb';

import './header.css';

interface HeaderProps {
  section: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header = ({ section, isSidebarOpen, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header__container">
        {!isSidebarOpen && (
          <Button 
            className="header-container__button-open-sidebar"
            onClick={onToggleSidebar}
          >
            <TbLayoutSidebarRightCollapse size={20} />
          </Button>
        )}
        {isSidebarOpen && (
          <Button 
            className="header-container__button-open-sidebar"
            onClick={onToggleSidebar}
          >
            <TbLayoutSidebarRightExpand size={20} />
          </Button>
        )}
        <span className="header-container__section">{section}</span>
      </div>
    </header>
  )
}
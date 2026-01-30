import { Button } from '../../ui';
import './header.css';
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpand } from 'react-icons/tb';

interface HeaderProps {
  section: string;
}

export const Header = ({ section }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header__container">
        <Button 
          className="header-container__button-open-sidebar"
          onClick={() => {}}
        >
          <TbLayoutSidebarRightCollapse size={20} />
        </Button>
        <Button 
          className="header-container__button-close-sidebar"
          onClick={() => {}}
        >
          <TbLayoutSidebarRightExpand size={20} />
        </Button>
        <span className="header-container__section">{section}</span>
      </div>
    </header>
  )
}
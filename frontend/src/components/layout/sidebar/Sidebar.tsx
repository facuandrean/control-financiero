import { NavLink } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';

import './sidebar.css';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar-logo">
        <h2>ZYKAN</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
          <MdDashboard /> <span>Resumen</span>
        </NavLink>
      </nav>
    </aside>
  );
};
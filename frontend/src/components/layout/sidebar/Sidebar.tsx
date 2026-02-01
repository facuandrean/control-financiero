import { NavLink } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';

import './sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  username: string;
  email: string;
}

export const Sidebar = ({ isOpen, username, email }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar-user">
        <div className="sidebar-user__icon">
          <FaUser size={20}  />
        </div>
        <div className="sidebar-user__info">
          <p className="sidebar-user__name">{username}</p>
          <p className="sidebar-user__email">{email}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
          <MdDashboard /> <span>Resumen</span>
        </NavLink>
      </nav>
    </aside>
  );
};
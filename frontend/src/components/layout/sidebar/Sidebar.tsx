import { NavLink } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';
import { LuArrowRightLeft, LuBuilding2, LuCreditCard, LuLogOut } from 'react-icons/lu';
import { FiTag } from 'react-icons/fi';

import './sidebar.css';
import { Button } from '../../ui';
import { useLogout } from '../../../hooks';

interface SidebarProps {
  isOpen: boolean;
  username: string;
  email: string;
}

export const Sidebar = ({ isOpen, username, email }: SidebarProps) => {
  const { handleLogout, loading } = useLogout();

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
        <NavLink to="/" className={({isActive}) => isActive ? 'sidebar-nav__item active' : 'sidebar-nav__item'}>
          <AiOutlineHome size={20} className="sidebar-nav__icon" />
          <span className="sidebar-nav__text">Dashboard</span>
        </NavLink>

        <NavLink to="/transactions" className={({isActive}) => isActive ? 'sidebar-nav__item active' : 'sidebar-nav__item'}>
          <LuArrowRightLeft size={20} className="sidebar-nav__icon" />
          <span className="sidebar-nav__text">Transacciones</span>
        </NavLink>

        <NavLink to="/entities" className={({isActive}) => isActive ? 'sidebar-nav__item active' : 'sidebar-nav__item'}>
          <LuBuilding2 size={20} className="sidebar-nav__icon" />
          
          <span className="sidebar-nav__text">Entidades</span>
        </NavLink>

        <NavLink to="/categories" className={({isActive}) => isActive ? 'sidebar-nav__item active' : 'sidebar-nav__item'}>
          <FiTag size={20} className="sidebar-nav__icon" />
          <span className="sidebar-nav__text">Categorías</span>
        </NavLink>

        <NavLink to="/accounts" className={({isActive}) => isActive ? 'sidebar-nav__item active' : 'sidebar-nav__item'}>
          <LuCreditCard  size={20} className="sidebar-nav__icon" />
          <span className="sidebar-nav__text">Cuentas</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <Button className="sidebar-footer__button" onClick={handleLogout} disabled={loading}>
          <LuLogOut size={20} className="sidebar-nav__icon" />
          <span className="sidebar-footer__text">{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
        </Button>
      </div>
    </aside>
  );
};
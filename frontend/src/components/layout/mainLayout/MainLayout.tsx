import { type ReactNode } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { Header } from '../header/Header';
import { useSidebar } from '../../../hooks';

import './mainLayout.css';
import '../sidebar/sidebar.css';

interface MainLayoutProps {
  children: ReactNode;
  section: string;
  username: string;
  email: string;
}

export const MainLayout = ({ children, section, username, email }: MainLayoutProps) => {
  const { isSidebarOpen, handleToggleSidebar } = useSidebar();

  return (
    <div className="main-layout">

      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={handleToggleSidebar}
          aria-hidden="true"
        />
      )}
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        username={username} 
        email={email}
      />

      <div className="main-content">
        <Header 
          section={section} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="page-container">
          {children}
        </main>
      </div>
    
    </div>
  );
};
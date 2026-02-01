import { useState, useEffect } from 'react';
import { loadSidebarState, saveSidebarState } from '../utils/sidebar.utils';

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(loadSidebarState);

  // Sincronizar con localStorage cuando cambia el estado
  useEffect(() => {
    saveSidebarState(isSidebarOpen);
  }, [isSidebarOpen]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return {
    isSidebarOpen,
    handleToggleSidebar,
  };
};

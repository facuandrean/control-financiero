/**
 * Carga el estado del sidebar del localStorage
 * Si no existe un estado guardado, retorna un valor por defecto según el tamaño de pantalla:
 * - Desktop (>= 1024px): abierto (true)
 * - Mobile (< 1024px): cerrado (false)
 */
export const loadSidebarState = (): boolean => {
  const savedState = localStorage.getItem('sidebarOpen');
  if (savedState !== null) {
    return savedState === 'true';
  }
  // Por defecto, en desktop está abierto, en mobile cerrado
  return window.innerWidth >= 1024;
};

/**
 * Guarda el estado del sidebar en localStorage
 */
export const saveSidebarState = (isOpen: boolean): void => {
  localStorage.setItem('sidebarOpen', String(isOpen));
};

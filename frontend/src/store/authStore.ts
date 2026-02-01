// Usamos Zustand para que cualquier componente de la app (el Navbar, el Perfil, etc.) sepa si estás logueado sin tener que pasar props a cada componente.

import { create } from 'zustand';
import { api } from '../api/axios';

interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Estado inicial: Cargamos el token y el usuario del localStorage, si existe.
  token: localStorage.getItem('accessToken'), // Intentamos leer si ya había sesión
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'), // True si hay token, False si es null
  
  setToken: (token: string) => {
    localStorage.setItem('accessToken', token); // Guardamos el token en el localStorage
    set({ token, isAuthenticated: true }); // Actualizamos el estado del store
  },
  
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user })
  }, // Actualizamos el estado del store con el usuario
  
  logout: async () => {
    try {
      // Intentamos avisar al backend para que borre la cookie y la sesión en DB
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Error al cerrar sesión en servidor");
    } finally {
      // Pase lo que pase (incluso si el backend está caído), limpiamos el front
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));
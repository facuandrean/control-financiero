import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/axios';

interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false, 
      
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      
      logout: async () => {
        try {
          // El backend se encarga de res.clearCookie()
          await api.post('/auth/logout');
        } catch (error) {
          console.error("Error al cerrar sesión en servidor", error);
        } finally {
          // Limpiamos el estado global (el persist limpiará el localStorage automáticamente)
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-store',
      // Opcional: solo persistir la parte del usuario
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setOnAuthFailure } from '../api/axios';

interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user, isCheckingAuth: false });
      },

      checkAuth: async () => {
        try {
          set({ isCheckingAuth: true });
          const response = await api.get('/users/me');
          const user = response.data.data;
          set({ user, isAuthenticated: true, isCheckingAuth: false });
        } catch {
          set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error("Error al cerrar sesión en servidor", error);
        } finally {
          set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          state.isCheckingAuth = true;
        }
      },
    }
  )
);

// Conectar con el interceptor de Axios para limpiar sesión cuando el token expire definitivamente
setOnAuthFailure(() => {
  useAuthStore.getState().setUser(null);
});
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './store';
import { HomePage, LoginPage, RegisterPage, TransactionsPage, EntitiesPage, CategoriesPage, AccountsPage, DebtsPage } from './pages';
import { Loading } from './components/ui';

import './App.css';

// Componente para proteger las rutas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Loading />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para evitar que usuarios logueados accedan a login o register
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Loading />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Si la sesión está marcada como activa, verificamos silenciosamente que la cookie siga viva en el servidor
    if (isAuthenticated) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Rutas privadas */}
        <Route path="/" element={
          <PrivateRoute>
            <HomePage section="Inicio" />
          </PrivateRoute>
        } />

        <Route path="/transactions" element={
          <PrivateRoute>
            <TransactionsPage section="Transacciones" />
          </PrivateRoute>
        } />

        <Route path="/entities" element={
          <PrivateRoute>
            <EntitiesPage section="Entidades" />
          </PrivateRoute>
        } />

        <Route path="/categories" element={
          <PrivateRoute>
            <CategoriesPage section="Categorías" />
          </PrivateRoute>
        } />

        <Route path="/accounts" element={
          <PrivateRoute>
            <AccountsPage section="Cuentas" />
          </PrivateRoute>
        } />

        <Route path="/debts" element={
          <PrivateRoute>
            <DebtsPage section="Deudas y Cobros" />
          </PrivateRoute>
        } />

        {/* Catch-all: Si no encuentra ruta, redirigir adecuadamente */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
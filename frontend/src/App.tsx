import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './store';
import { HomePage, LoginPage, RegisterPage } from './pages';

import './App.css';

// Componente para proteger las rutas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas privadas */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <HomePage 
                section="Dashboard"
              />
            </PrivateRoute>
          } 
        />

        {/* Catch-all: Si no encuentra ruta, manda a la página de login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
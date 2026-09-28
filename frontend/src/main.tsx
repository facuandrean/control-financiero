import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';

const GOOGLE_CLIENT_ID = '867079303651-jstcsunru0h51bo1t6a2ej601sgapmaf.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
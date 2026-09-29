import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import { config } from '../config';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import {AuthGate} from './auth/AuthGate';
import {AuthProvider} from './auth/AuthContext';
import './styles.css';
import './auth/auth.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthProvider><AuthGate/></AuthProvider></React.StrictMode>);

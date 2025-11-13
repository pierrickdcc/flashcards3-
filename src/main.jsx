import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataSyncProvider } from './context/DataSyncContext.jsx';
import { UIStateProvider } from './context/UIStateContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataSyncProvider>
        <UIStateProvider>
          <App />
        </UIStateProvider>
      </DataSyncProvider>
    </AuthProvider>
  </StrictMode>
);

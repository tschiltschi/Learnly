import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStoreProvider } from './store/AppStore';
import { BackendSync } from './services/backend/BackendSync';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStoreProvider>
      <BackendSync />
      <App />
    </AppStoreProvider>
  </StrictMode>,
);

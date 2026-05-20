import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSiteDesign } from './services/siteDesignConfig';
import { LocaleCurrencyProvider } from './context/LocaleCurrencyContext';

initSiteDesign();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleCurrencyProvider>
      <App />
    </LocaleCurrencyProvider>
  </StrictMode>,
);

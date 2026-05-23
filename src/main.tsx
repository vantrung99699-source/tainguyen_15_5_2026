import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSiteDesign } from './services/siteDesignConfig';
import { LocaleCurrencyProvider } from './context/LocaleCurrencyContext';
import { InlineTranslationProvider } from './context/InlineTranslationContext';

initSiteDesign();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleCurrencyProvider>
      <InlineTranslationProvider>
        <App />
      </InlineTranslationProvider>
    </LocaleCurrencyProvider>
  </StrictMode>,
);

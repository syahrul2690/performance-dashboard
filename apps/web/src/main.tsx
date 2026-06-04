import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import { PeriodProvider } from './context/PeriodContext';
import App from './App';
import './lib/charts';
import './styles/prototype.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotifProvider>
            <PeriodProvider>
              <App />
            </PeriodProvider>
          </NotifProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

window.addEventListener('error', (event) => {
  console.error('[Roadfix Window Error]', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Roadfix Unhandled Rejection]', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


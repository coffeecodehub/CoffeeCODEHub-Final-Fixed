import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SiteProvider } from './context/SiteContext.jsx';

createRoot(document.getElementById('root')).render(
  <SiteProvider>
    <App />
  </SiteProvider>
);
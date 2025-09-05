import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <CookiesProvider>
      <BrowserRouter>
        <Toaster />
          <App />
      </BrowserRouter>
    </CookiesProvider>
  );
} else {
  console.error("Root element not found");
}

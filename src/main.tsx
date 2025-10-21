import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';
import "katex/dist/katex.min.css";

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <CookiesProvider>
      <BrowserRouter>
        <Toaster
          toastOptions={{
            style: {
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              fontWeight: 500,
            },
          }} />
        <App />
      </BrowserRouter>
    </CookiesProvider>
  );
} else {
  console.error("Root element not found");
}

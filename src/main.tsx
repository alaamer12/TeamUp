import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installAllErrorHandlers } from './utils/error-handlers'
import './router-config.js'
import { LanguageProvider } from './components/LanguageProvider'
import { initializeApplication } from './utils/index'

// Install global error handlers to catch and suppress extension errors
installAllErrorHandlers(true);

// Initialize the application and clear any stale cache
initializeApplication()
  .then(() => console.log('Application initialized successfully'))
  .catch(err => console.error('Failed to initialize application:', err));

// Safe root mounting
const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
  } catch (error) {
    console.error('Failed to render React application:', error);
    // Fallback content if React fails to render
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Something went wrong</h1>
        <p>The application failed to initialize. Please try refreshing the page or disabling browser extensions.</p>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installAllErrorHandlers } from './utils/error-handlers'
import './router-config.js'

// Install global error handlers to catch and suppress extension errors
installAllErrorHandlers(true);

// Safe root mounting
const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
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

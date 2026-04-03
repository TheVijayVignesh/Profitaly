import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-minimal.tsx'
import './index.css'

console.log('Application starting...');

// Get root element to mount app
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Root element not found! Make sure there is a div with id="root" in index.html');
} else {
  try {
    // Create the React root and render the app
    console.log('Creating React root and rendering app...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering the application:', error);
    
    // Display a fallback error message in the DOM
    rootElement.innerHTML = `
      <div style="padding: 20px; margin: 30px auto; max-width: 600px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #e11d48;">Application Error</h1>
        <p>There was a problem loading the application.</p>
        <pre style="background: #f1f5f9; padding: 15px; border-radius: 4px; text-align: left; overflow: auto;">${error?.message || 'Unknown error'}</pre>
        <button 
          style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin-top: 20px; cursor: pointer;"
          onclick="window.location.reload()"
        >
          Reload Application
        </button>
      </div>
    `;
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { checkEnvironmentVariables } from './utils/envTest'

console.log('Application starting...');

// Check if all required environment variables are loaded
checkEnvironmentVariables();

// Error boundary for handling rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2>Something went wrong rendering the application</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '15px', 
              padding: '8px 15px', 
              backgroundColor: '#0d6efd', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// Get the root element to mount the app
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Root element not found! Make sure there is a div with id="root" in index.html');
} else {
  try {
    // Create the React root and render the app
    console.log('Creating React root and rendering app...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
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

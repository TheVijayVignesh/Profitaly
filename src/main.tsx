import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Application starting...');

// Simple error boundary that won't break the app
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#1a1b26',
          color: '#c0caf5',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ color: '#f7768e', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '20px' }}>The application encountered an error.</p>
          <details style={{ marginBottom: '20px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ 
              background: '#24283b', 
              padding: '15px', 
              borderRadius: '8px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#7aa2f7', 
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

// Get root element and render app
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Root element not found!');
} else {
  console.log('Rendering app...');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('App rendered successfully');
}

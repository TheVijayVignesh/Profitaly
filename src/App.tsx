import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";
import Chatbot from "./features/ai-chatbot";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import TrialRoom from "./pages/TrialRoom";
import SmartAdvisor from "./pages/SmartAdvisor";
import NotFound from "./pages/NotFound";
import Diagnostic from "./pages/Diagnostic";
import ProfilePage from "./pages/Profile";
import Settings from "./pages/Settings";

// Import Fantasy Grounds routes

const queryClient = new QueryClient();

// Error fallback component
const ErrorFallback = ({ error }) => {
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
      <h2>Something went wrong</h2>
      <div style={{ background: '#f1f5f9', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '12px' }}>{error?.message || 'Unknown error'}</p>
      </div>
      <p>Please try refreshing the page.</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#0d6efd', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Refresh Page
      </button>
    </div>
  );
};

// App component with error handling
const App = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event) => {
      console.error("Global error:", event.error);
      setError(event.error);
      event.preventDefault();
    };

    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  // If there's an error, show the error fallback
  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
                {/* Diagnostic Route */}
                <Route path="/diagnostic" element={<Diagnostic />} />
                
            {/* Public Routes */}
            <Route path="/" element={<Layout withSidebar={false} />}>
              <Route index element={<Index />} />
            </Route>

                {/* All routes now accessible without authentication */}
                <Route 
                  path="/" 
                  element={
                      <>
                        <Layout withSidebar={true} />
                        <Chatbot />
                      </>
                  }
                >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stocks" element={<Stocks />} />
                  <Route path="/smart-advisor" element={<SmartAdvisor />} />
              <Route path="/trial-room" element={<TrialRoom />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<Settings />} />
              {/* Other dashboard routes will go here */}
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;

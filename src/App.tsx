import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";
import RequireAuth from "./components/RequireAuth";
import { Chatbot } from "./features/ai-chatbot";

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
import { fantasyGroundsRoutes } from "./routes/fantasy-grounds-routes";

const queryClient = new QueryClient();

// Error fallback component
const ErrorFallback = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20">
      <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h2>
        <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-md mb-4">
          <p className="font-mono text-sm">{error.message}</p>
        </div>
        <p className="mb-4">Please try refreshing the page or contact support if the problem persists.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
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
      // Prevent the default browser error overlay
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
      <AuthProvider>
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

                {/* Protected Dashboard Routes with Sidebar */}
                <Route 
                  path="/" 
                  element={
                    <RequireAuth>
                      <>
                        <Layout withSidebar={true} />
                        <Chatbot />
                      </>
                    </RequireAuth>
                  }
                >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stocks" element={<Stocks />} />
                  <Route path="/smart-advisor" element={<SmartAdvisor />} />
              <Route path="/trial-room" element={<TrialRoom />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Fantasy Grounds Routes */}
                  {fantasyGroundsRoutes.map((route) => (
                    <Route 
                      key={route.path} 
                      path={route.path} 
                      element={route.element} 
                    />
                  ))}
                  
              {/* Other dashboard routes will go here */}
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;

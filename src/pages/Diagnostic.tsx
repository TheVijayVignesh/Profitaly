import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * A diagnostic page component to help troubleshoot rendering issues
 */
const Diagnostic = () => {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check important environment variables
      const vars = {
        'NODE_ENV': import.meta.env.MODE || 'unknown',
        'DEV': import.meta.env.DEV ? 'true' : 'false',
        'VITE_FINNHUB_API_KEY': import.meta.env.VITE_FINNHUB_API_KEY ? '[Set]' : '[Not Set]',
        'VITE_TWELVEDATA_API_KEY': import.meta.env.VITE_TWELVEDATA_API_KEY ? '[Set]' : '[Not Set]',
        'VITE_PERPLEXITY_API_KEY': import.meta.env.VITE_PERPLEXITY_API_KEY ? '[Set]' : '[Not Set]',
        'VITE_TRENDLYNE_API_KEY': import.meta.env.VITE_TRENDLYNE_API_KEY ? '[Set]' : '[Not Set]',
        'VITE_USE_MOCK_AUTH': import.meta.env.VITE_USE_MOCK_AUTH || '[Not Set]',
      };
      
      setEnvVars(vars);
    } catch (err) {
      console.error('Error checking environment variables:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Application Diagnostic</h1>
      
      {error && (
        <Card className="mb-6 border-red-500">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-700 dark:text-red-300">Error Detected</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
              {error}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Browser Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">User Agent</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                {navigator.userAgent}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Window Size</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                {window.innerWidth} x {window.innerHeight}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rendering Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>If you can see this text, basic rendering is working.</p>
          <p className="mt-2">
            The diagnostic page successfully rendered, which means React and the 
            main application components are functioning. If other pages aren't loading,
            there might be specific errors in those components.
          </p>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Component Rendering</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-md">
                Grid Item 1
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-md">
                Grid Item 2
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-md">
                Grid Item 3
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-md">
                Grid Item 4
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-4">
        <a 
          href="/" 
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Go to Home
        </a>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default Diagnostic; 
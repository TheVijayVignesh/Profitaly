/**
 * Utility to test if environment variables are properly loaded
 */
export function checkEnvironmentVariables() {
  // Check if we're in development mode
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    console.log('==== Running in DEVELOPMENT mode with MOCK DATA ====');
    console.log('API keys are not required in development mode');
    console.log('The application will use mock data for all services');
    console.log('======================================================');
    return { mockMode: true };
  }
  
  const envVars = {
    'VITE_FINNHUB_API_KEY': import.meta.env.VITE_FINNHUB_API_KEY,
    'VITE_TWELVEDATA_API_KEY': import.meta.env.VITE_TWELVEDATA_API_KEY,
    'VITE_PERPLEXITY_API_KEY': import.meta.env.VITE_PERPLEXITY_API_KEY,
    'VITE_TRENDLYNE_API_KEY': import.meta.env.VITE_TRENDLYNE_API_KEY
  };
  
  console.log('==== Environment Variables Test ====');
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value && value.length > 0) {
      // Just show that it exists, not the actual value for security
      console.log(`✅ ${key}: [Set]`);
    } else {
      console.log(`⚠️ ${key}: [Not Set]`);
    }
  });
  
  console.log('======================================');
  
  if (!envVars.VITE_FINNHUB_API_KEY || 
      !envVars.VITE_TWELVEDATA_API_KEY || 
      !envVars.VITE_PERPLEXITY_API_KEY ||
      !envVars.VITE_TRENDLYNE_API_KEY) {
    console.info('Some API keys are missing! The app will fallback to mock data where possible.');
    
    // Instructions for fixing the issue
    console.info(`
For a production environment:
1. Make sure you have a .env file in the root directory
2. Ensure it contains the following variables:
   VITE_FINNHUB_API_KEY=your_api_key
   VITE_TWELVEDATA_API_KEY=your_api_key
   VITE_PERPLEXITY_API_KEY=your_api_key
   VITE_TRENDLYNE_API_KEY=your_api_key
3. Restart the server
`);
  }
  
  return envVars;
} 
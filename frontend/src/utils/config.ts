// Environment configuration for independent deployment

export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Stack Auth Configuration
  STACK_PROJECT_ID: import.meta.env.VITE_STACK_PROJECT_ID || '',
  STACK_PUBLISHABLE_KEY: import.meta.env.VITE_STACK_PUBLISHABLE_KEY || '',
  
  // App Configuration
  APP_NAME: 'Mindflow',
  APP_DESCRIPTION: 'Your wellness companion',
  
  // Feature Flags
  FEATURES: {
    CHAT_ENABLED: true,
    JOURNAL_ENABLED: true,
    SELFCARE_ENABLED: true,
    PROGRESS_ENABLED: true,
    MOOD_TRACKING_ENABLED: true,
  },
  
  // Theme Configuration
  DEFAULT_THEME: 'system' as 'light' | 'dark' | 'system',
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// Validate required environment variables
if (config.IS_PRODUCTION) {
  const requiredEnvVars = [
    'VITE_API_URL',
    'VITE_STACK_PROJECT_ID', 
    'VITE_STACK_PUBLISHABLE_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error(
      'Missing required environment variables:', 
      missingVars.join(', ')
    );
  }
}

export default config;

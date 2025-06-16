// Global type declarations for the application

// Extend Window interface to include our admin mode flag
interface Window {
  __ADMIN_MODE__?: boolean;
}

// Extend process.env with our environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_ADMIN_PASSWORD?: string;
    [key: string]: string | undefined;
  }
} 
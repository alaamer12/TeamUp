import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  define: {
    // Set React Router future flags to resolve warnings
    'process.env.ROUTER_FUTURE_v7_relativeSplatPath': 'true',
    'process.env.ROUTER_FUTURE_v7_startTransition': 'true',
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Improve build performance and output
    target: 'es2015',
    sourcemap: mode !== 'production',
    minify: mode === 'production',
    cssMinify: mode === 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}));

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // Check for required environment variables
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: Supabase environment variables are missing!');
    console.warn('\x1b[33m%s\x1b[0m', '   The app will default to "Offline Mode" (Local Storage).');
    console.warn('\x1b[33m%s\x1b[0m', '   To fix this, ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  }

  return {
    plugins: [react()],
    base: './',
    define: {
      // Explicitly define environment variables for the client
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  }
})

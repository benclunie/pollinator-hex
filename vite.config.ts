import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '/pollinator-hex/', // Matches your repo name https://benclunie.github.io/pollinator-hex/
    build: {
      outDir: 'dist',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import tailwindcss

// https://vitejs.dev/config/
export default defineConfig({
  // Add tailwindcss() to the plugins array
  plugins: [react(), tailwindcss()],

  // This 'define' block fixes the "global is not defined" error
  define: {
    'global': 'window',
  }
})


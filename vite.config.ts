import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base: './'` keeps asset URLs relative, so the build works on GitHub Pages
// under /<repo>/ without hardcoding the repository name.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});

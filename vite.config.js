import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' to make the build work from any subpath
export default defineConfig({
    base: './',
    plugins: [svelte()],
    // Vite defaults to Port 5173
    server: {
        open: true,     // automatically opens browser once server starts
    }
});
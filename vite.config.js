import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    // Relative asset paths, make base './' so that the build work from any subpath
    // Note that Github Pages project site is located at "https://<user>.github.io/<repo>/"
    base: './',
    // Need this for Vite to configure Svelte files
    plugins: [svelte()],
    // Vite defaults to Port 5173
    server: {
        open: true,     // automatically opens browser once server starts
    }
});
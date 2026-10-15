import './app.css';     // Vite automatically applies the imported styles globally
import { mount } from 'svelte';
import App from './App.svelte';

// Execute the mounting process: inject App into the HTML component with id="app" 
export default mount(App, { target: document.getElementById("app") });
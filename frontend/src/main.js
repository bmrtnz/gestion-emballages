// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Importer Pinia
import App from './App.vue'
import router from './router';
import './assets/tailwind.css'; // Use Tailwind CSS

const pinia = createPinia() // 2. Créer une instance de Pinia
const app = createApp(App);

app.use(pinia) // 3. Dire à Vue d'utiliser Pinia
app.use(router);

app.mount('#app');
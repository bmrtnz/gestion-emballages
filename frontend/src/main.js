// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Importer Pinia
import App from './App.vue'
import router from './router';
import './assets/main.css';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const pinia = createPinia() // 2. Créer une instance de Pinia
const app = createApp(App);

app.use(pinia) // 3. Dire à Vue d'utiliser Pinia
app.use(router);
app.use(Antd);

app.mount('#app');
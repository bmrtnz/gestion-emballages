// frontend/src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // L'URL de base de notre backend
});

// Intercepteur de requête : s'exécute AVANT chaque requête
api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  const token = authStore.token; // Lire le token depuis le store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
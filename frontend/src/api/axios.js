// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // L'URL de base de notre backend
  timeout: 10000, // Timeout de 10 secondes
});

// Intercepteur de requête : s'exécute AVANT chaque requête
api.interceptors.request.use(config => {
  // Le token sera automatiquement ajouté par le store auth lors de l'initialisation
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Intercepteur de réponse : s'exécute APRÈS chaque réponse
api.interceptors.response.use(
  response => {
    // Retourner la réponse si tout va bien
    return response;
  },
  error => {
    // Gestion centralisée des erreurs réseau
    if (!error.response) {
      // Erreur réseau (pas de réponse du serveur)
      error.message = 'Erreur de connexion au serveur';
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      error.message = 'La requête a pris trop de temps';
    }
    
    // Laisser les composables gérer les erreurs spécifiques
    return Promise.reject(error);
  }
);

export default api;
// frontend/src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import { notification } from '../composables/useNotification';
import api from '../api/axios';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
    // STATE
    const user = ref(null);
    const token = ref(localStorage.getItem('userToken') || null);

    // Composables
    const { isLoading: loginLoading, execute: executeLogin } = useLoading();
    const { isLoading: fetchLoading, execute: executeFetch } = useLoading();
    const { withErrorHandling } = useErrorHandler();

    // GETTERS (computed properties)
    const isAuthenticated = computed(() => !!token.value);
    const userRole = computed(() => user.value?.role);
    const isLoading = computed(() => loginLoading.value || fetchLoading.value);

    // === ACTIONS (fonctions pour modifier le state) ===
    function setToken(newToken) {
        token.value = newToken;
        localStorage.setItem('userToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }

    function clearToken() {
        token.value = null;
        localStorage.removeItem('userToken');
        delete api.defaults.headers.common['Authorization'];
    }

    // ACTIONS
    async function login(credentials) {
        return executeLogin(async () => {
            const response = await withErrorHandling(
                () => api.post('/users/login', credentials),
                'Erreur de connexion'
            );
            
            const { token: newToken, ...userData } = response.data;
            setToken(newToken);
            user.value = userData;
            notification.success('Connexion réussie ! Bienvenue.');
            router.push('/dashboard');
            return response.data;
        });
    }

    function logout() {
        clearToken();
        user.value = null;
        router.push('/login');
    }
    
    // Action pour récupérer le profil si un token existe (ex: après un F5)
    async function fetchUser() {
        if (token.value && !user.value) {
            return executeFetch(async () => {
                try {
                    const response = await api.get('/users/profile');
                    user.value = response.data;
                    return response.data;
                } catch (error) {
                    console.error("Impossible de récupérer l'utilisateur, token invalide.", error);
                    logout(); // Nettoyer si le token est mauvais
                    throw error;
                }
            });
        }
    }

    return { 
        user, 
        token, 
        isAuthenticated, 
        userRole, 
        isLoading,
        loginLoading,
        fetchLoading,
        login, 
        logout, 
        fetchUser 
    };
});
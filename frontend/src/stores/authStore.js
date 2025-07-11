// frontend/src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/axios';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
    // STATE
    const user = ref(null);
    const token = ref(localStorage.getItem('userToken') || null);

    // GETTERS (computed properties)
    const isAuthenticated = computed(() => !!token.value);
    const userRole = computed(() => user.value?.role);

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
        const response = await api.post('/users/login', credentials);
        const { token: newToken, ...userData } = response.data;
        setToken(newToken);
        user.value = userData;
        router.push('/dashboard');
    }

    function logout() {
        clearToken();
        user.value = null;
        router.push('/login');
    }
    
    // Action pour récupérer le profil si un token existe (ex: après un F5)
    async function fetchUser() {
        if (token.value && !user.value) {
            try {
                const response = await api.get('/users/profile');
                user.value = response.data;
            } catch (error) {
                console.error("Impossible de récupérer l'utilisateur, token invalide.", error);
                logout(); // Nettoyer si le token est mauvais
            }
        }
    }

    return { user, token, isAuthenticated, userRole, login, logout, fetchUser };
});
<script setup>
import { useAuthStore } from "../stores/authStore";
import { useFormValidation, commonValidationRules } from "../composables/useFormValidation";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import Button from "../components/ui/Button.vue";

const authStore = useAuthStore();

// Form Validation
const { formData, validateForm, getFieldProps, getFieldMessage } = useFormValidation(
    {
        email: "",
        password: "password123",
    },
    {
        email: commonValidationRules.email,
        password: [(value) => (!value || !value.trim() ? "Mot de passe requis" : null)],
    }
);

const handleLogin = async () => {
    if (!validateForm()) {
        return;
    }

    try {
        await authStore.login(formData);
    } catch (error) {
        console.error("Login failed:", error);
    }
};
</script>

<template>
    <div class="min-h-screen flex flex-col lg:flex-row bg-gray-50">
        <!-- Left Panel (Decorative) -->
        <div class="flex lg:w-1/2 w-full h-64 lg:h-auto relative items-center justify-center bg-gray-800">
            <div
                class="absolute inset-0 bg-cover bg-center"
                style="background-image: url('https://source.unsplash.com/random/1200x900?abstract')"
            >
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            </div>
            <div class="relative text-center p-4 lg:p-8 animate-fade-in">
                <div class="relative w-24 h-24 lg:w-48 lg:h-48 mb-3 lg:mb-6 mx-auto">
                    <div class="absolute inset-0 bg-white/80 rounded-full"></div>
                    <div class="absolute inset-2 bg-white/80 rounded-full"></div>
                    <img src="@/assets/favicon.png" alt="Logo" class="relative w-full h-full p-2 lg:p-6" />
                </div>
                <h1 class="text-2xl lg:text-5xl font-bold text-white mb-2 lg:mb-4 font-display">
                    Ravi de vous revoir !
                </h1>
                <p class="text-sm lg:text-xl text-gray-300 font-medium">
                    Bienvenue sur le nouveau
                    <span class="font-bold text-primary-400">Portail Embadif</span>
                </p>
            </div>
        </div>

        <!-- Right Panel (Login Form) -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 flex-1">
            <div class="max-w-md w-full">
                <div class="text-center mb-6 lg:mb-10">
                    <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-display">Connexion</h1>
                    <p class="text-base lg:text-lg text-gray-600">Entrez vos identifiants pour continuer.</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <!-- Email Field -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                            Adresse e-mail
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                v-model="formData.email"
                                @blur="() => getFieldProps('email').onBlur()"
                                placeholder="vous@exemple.com"
                                autocomplete="email"
                                required
                                :class="[
                                    'block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
                                    getFieldMessage('email') ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-400'
                                ]"
                            />
                        </div>
                        <p v-if="getFieldMessage('email')" class="mt-1 text-sm text-red-600">
                            {{ getFieldMessage('email') }}
                        </p>
                    </div>

                    <!-- Password Field -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon class="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                v-model="formData.password"
                                @blur="() => getFieldProps('password').onBlur()"
                                placeholder="••••••••"
                                autocomplete="current-password"
                                required
                                :class="[
                                    'block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
                                    getFieldMessage('password') ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-400'
                                ]"
                            />
                        </div>
                        <p v-if="getFieldMessage('password')" class="mt-1 text-sm text-red-600">
                            {{ getFieldMessage('password') }}
                        </p>
                    </div>

                    <div class="flex items-center justify-between">
                        <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Mot de passe oublié ?
                        </a>
                    </div>

                    <div>
                        <Button type="submit" variant="primary" size="lg" block :loading="authStore.loginLoading">
                            Se connecter
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

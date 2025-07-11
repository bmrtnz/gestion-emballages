<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/authStore'; // Importer le store
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';

const authStore = useAuthStore(); // Utiliser le store
const formState = reactive({ email: '', password: '' });
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // Appeler l'action 'login' du store
    await authStore.login(formState);
  } catch (error) {
    errorMessage.value = 'Email ou mot de passe invalide.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-form-container">
            <div class="login-header">
        <img src="@/assets/favicon.png" alt="Logo" style="width: 50%; height: auto;" />
        <h3>&nbsp;OctoLINK</h3>        
      </div>
      <p class="subtitle">Connectez-vous à votre compte</p>
      
      <a-form :model="formState" @finish="handleLogin">
        <a-form-item name="email" :rules="[{ required: true, message: 'Veuillez entrer votre email!' }]">
          <a-input v-model:value="formState.email" placeholder="Adresse email">
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]">
          <a-input-password v-model:value="formState.password" placeholder="Mot de passe">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>
        
        <a-alert v-if="errorMessage" :message="errorMessage" type="error" show-icon style="margin-bottom: 24px;" />

        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="isLoading">
            Se connecter
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
h3 {
  color: rgb(209, 1, 122);
  text-align: center;
}
.login-header {
  padding: 1.5rem;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
/* La plupart de nos styles customisés sont maintenant inutiles, Ant Design s'en charge ! */
.login-page {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-form-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}
h1 {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.subtitle {
  text-align: center;
  color: var(--text-color-light);
  margin-bottom: 2.5rem;
}
</style>
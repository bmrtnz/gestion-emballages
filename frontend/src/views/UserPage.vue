<script setup>
import { ref } from 'vue';
import UserList from '../components/users/UserList.vue';
import Button from '../components/ui/Button.vue';
import SlidePanel from '../components/ui/SlidePanel.vue';
import UserCreateForm from '../components/users/UserCreateForm.vue';

const isCreatePanelOpen = ref(false);
const userListRef = ref(null);

const handleAddUser = () => {
  isCreatePanelOpen.value = true;
};

const handleUserCreated = () => {
  isCreatePanelOpen.value = false;
  // Refresh the user list after creation
  if (userListRef.value) {
    userListRef.value.fetchUsers();
  }
};
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center mb-8">
            <div class="sm:flex-auto">
                <h1 class="text-3xl font-bold text-gray-900">Utilisateurs</h1>
                <p class="mt-1 text-sm text-gray-500">Gérez les utilisateurs de la plateforme ici.</p>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button variant="primary" size="md" @click="handleAddUser">Ajouter un Utilisateur</Button>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft p-6">
            <UserList ref="userListRef" />
        </div>

        <SlidePanel :open="isCreatePanelOpen" @close="isCreatePanelOpen = false" title="Ajouter un nouvel utilisateur" size="md">
            <UserCreateForm @created="handleUserCreated" @close="isCreatePanelOpen = false" />
        </SlidePanel>
    </div>
</template>
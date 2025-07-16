<script setup>
import { ref } from 'vue';
import ArticleList from '../components/ArticleList.vue';
import ArticleCreateForm from '../components/articles/ArticleCreateForm.vue';
import Button from '../components/ui/Button.vue';
import Modal from '../components/ui/Modal.vue';

const isCreateModalOpen = ref(false);

const handleArticleCreated = () => {
  isCreateModalOpen.value = false;
  // Here you might want to trigger a refresh of the article list
};
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center mb-8">
            <div class="sm:flex-auto">
                <h1 class="text-3xl font-bold text-gray-900">Catalogue des Articles</h1>
                <p class="mt-1 text-sm text-gray-500">Parcourez et gérez tous les articles ici.</p>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button variant="primary" size="md" @click="isCreateModalOpen = true">Ajouter un Article</Button>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft p-6">
            <ArticleList />
        </div>

        <Modal :open="isCreateModalOpen" @close="isCreateModalOpen = false" title="Ajouter un nouvel article">
            <ArticleCreateForm @created="handleArticleCreated" @close="isCreateModalOpen = false" />
        </Modal>
    </div>
</template>
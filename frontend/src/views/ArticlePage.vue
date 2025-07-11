<script setup>
import ArticleList from '../components/ArticleList.vue';
</script>

<template>
    <div class="page-container">
        <div class="page-header">
            <h1>Catalogue des Articles</h1>
        </div>
        <ArticleList />
    </div>
</template>

<style scoped>
.page-header {
    margin-bottom: 2rem;
}
</style>
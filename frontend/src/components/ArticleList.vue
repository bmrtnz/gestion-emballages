<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import api from '../api/axios';
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import Button from './ui/Button.vue';

const authStore = useAuthStore();

// State
const articles = ref([]);
const selectedArticles = ref([]);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Fetch articles
const fetchArticles = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get('/articles'),
      'Failed to load articles'
    );
    articles.value = response.data;
  });
};

onMounted(fetchArticles);

const isAllSelected = computed({
  get() {
    return articles.value.length > 0 && selectedArticles.value.length === articles.value.length;
  },
  set(value) {
    selectedArticles.value = value ? articles.value.map(a => a._id) : [];
  }
});

const toggleSelection = (id) => {
    const index = selectedArticles.value.indexOf(id);
    if (index > -1) {
        selectedArticles.value.splice(index, 1);
    } else {
        selectedArticles.value.push(id);
    }
};

</script>

<template>
  <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="relative">
          <table class="min-w-full table-fixed divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" class="relative px-7 sm:w-12 sm:px-6">
                  <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600" :checked="isAllSelected" @change="isAllSelected = $event.target.checked" />
                </th>
                <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Nom du Produit</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock Initial</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vendu</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date d'Ajout</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prix</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Note</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                  <span class="sr-only">Modifier</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="article in articles" :key="article._id" :class="[selectedArticles.includes(article._id) && 'bg-gray-50']">
                <td class="relative px-7 sm:w-12 sm:px-6">
                  <div v-if="selectedArticles.includes(article._id)" class="absolute inset-y-0 left-0 w-0.5 bg-primary-600"></div>
                  <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600" :value="article._id" v-model="selectedArticles" />
                </td>
                <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium" :class="[selectedArticles.includes(article._id) ? 'text-primary-600' : 'text-gray-900']">{{ article.designation }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ article.codeArticle }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ article.categorie }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Jul 14, 2023</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$1,200</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">4.8</td>
                <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                  <button class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Modifier">
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors ml-2" title="Supprimer">
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ArticleList from './ArticleList.vue';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/vue/20/solid';
import Button from './ui/Button.vue';

const stats = [
  { name: 'Revenu de Décembre', stat: '287,000 €', previousStat: '250,000 €', change: '12%', changeType: 'increase', tags: ['Macbook m2', 'iPhone 15'] },
  { name: 'Ventes de Décembre', stat: '4,5k', previousStat: '4,2k', change: '9.18%', changeType: 'increase', tags: ['1,272 iPhone 15', '675 Macbook'] },
]
</script>

<template>
  <div>
    <!-- Page Title -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p class="mt-1 text-sm text-gray-500">Toutes les informations générales apparaissent dans ce champ</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- December Report Card -->
        <div class="lg:col-span-1 bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center text-center">
            <div class="relative w-24 h-24 mb-4">
                <div class="absolute inset-0 bg-primary-100 rounded-full opacity-50"></div>
                <div class="absolute inset-2 bg-primary-200 rounded-full opacity-60"></div>
                <img src="@/assets/favicon.png" alt="Rocket" class="relative w-full h-full p-4" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Rapport de Décembre</h2>
            <p class="text-sm text-gray-500 mt-1 mb-4">Récupérez le rapport de décembre, analysez les données clés pour des décisions stratégiques éclairées.</p>
            <div class="flex gap-x-4">
                <Button variant="primary" size="md">Analyser</Button>
                <Button variant="secondary" size="md">Télécharger</Button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="item in stats" :key="item.name" class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">{{ item.name }}</p>
                        <p class="mt-1 text-3xl font-bold text-gray-900">{{ item.stat }}</p>
                    </div>
                    <div :class="[item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'inline-flex items-baseline rounded-full px-2.5 py-1 text-sm font-medium']">
                        <ArrowUpIcon v-if="item.changeType === 'increase'" class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500" aria-hidden="true" />
                        <ArrowDownIcon v-else class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
                        <span class="sr-only"> {{ item.changeType === 'increase' ? 'Augmenté' : 'Diminué' }} de </span>
                        {{ item.change }}
                    </div>
                </div>
                <div class="mt-4 flex space-x-2">
                    <span v-for="tag in item.tags" :key="tag" class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"># {{ tag }}</span>
                </div>
                <!-- Simple chart placeholder -->
                <div class="mt-6 h-16 bg-gray-50 rounded-lg"></div>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-soft p-6">
        <div class="sm:flex sm:items-center mb-4">
            <div class="sm:flex-auto">
                <h2 class="text-base font-semibold leading-6 text-gray-900">Publié</h2>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button variant="primary" size="md">Exporter</Button>
            </div>
        </div>
        <ArticleList />
    </div>
  </div>
</template>
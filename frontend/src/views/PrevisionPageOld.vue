<template>
  <div>
    <div class="sm:flex sm:items-center mb-8">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">Prévisions</h1>
        <p class="mt-1 text-sm text-gray-500">Gestion des prévisions de consommation par campagne.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button 
          v-if="canCreatePrevision"
          variant="primary" 
          size="md"
          @click="openCreatePanel"
        >
          Ajouter une prévision
        </Button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-soft p-6">
      <!-- Search and Filters -->
      <div class="space-y-4">
        <!-- Control Bar -->
        <div class="flex items-center space-x-4">
          <!-- Tree Toggle -->
          <button 
            @click="toggleTreeState"
            class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title="Tout développer/réduire"
          >
            <ChevronDoubleUpIcon v-if="isTreeExpanded" class="h-4 w-4" />
            <ChevronDoubleDownIcon v-else class="h-4 w-4" />
          </button>
          
          <!-- Filters Toggle -->
          <button 
            @click="showFilters = !showFilters"
            class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FunnelIcon class="h-4 w-4 mr-2" />
            Filtres
            <span v-if="activeFiltersCount > 0" class="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full">
              {{ activeFiltersCount }}
            </span>
            <ChevronDownIcon 
              class="ml-2 h-4 w-4 transition-transform duration-200" 
              :class="{ 'rotate-180': showFilters }"
            />
          </button>
          
          <!-- Search Input -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Rechercher par campagne ou fournisseur..."
            />
          </div>
        </div>
        
        <!-- Filters Panel -->
        <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <!-- Campagne Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Campagne</label>
              <select 
                v-model="filters.campagne"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Toutes les campagnes</option>
                <option value="24-25">2024-2025</option>
                <option value="25-26">2025-2026</option>
                <option value="26-27">2026-2027</option>
              </select>
            </div>

            <!-- Fournisseur Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
              <select 
                v-model="filters.fournisseurId"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Tous les fournisseurs</option>
                <option v-for="fournisseur in fournisseurs" 
                        :key="fournisseur._id" 
                        :value="fournisseur._id">
                  {{ fournisseur.nom }}
                </option>
              </select>
            </div>


            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select 
                v-model="filters.status"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end">
            <Button variant="secondary" size="sm" @click="clearFilters">
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mt-6 flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
          <span class="text-red-800">{{ error }}</span>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="mt-6">
        <!-- Mobile View -->
        <div class="block md:hidden space-y-4">
          <div v-for="prevision in previsions" 
               :key="prevision._id" 
               class="bg-white rounded-lg border border-gray-200 p-4">
            <!-- Main Prevision Info -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center">
                  <button 
                    v-if="prevision.articlesPrevisions?.length > 0"
                    @click="toggleExpanded(prevision._id)"
                    class="mr-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <ChevronRightIcon 
                      class="h-4 w-4 text-gray-500 transition-transform" 
                      :class="{ 'rotate-90': isExpanded(prevision._id) }"
                    />
                  </button>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ prevision.campagne }}
                  </span>
                </div>
                <h3 class="font-medium text-gray-900 mt-2">
                  {{ prevision.fournisseurId?.nom }}
                </h3>
                <p class="text-sm text-gray-600">
                  Site {{ getSiteName(prevision) }} • {{ prevision.articlesPrevisions?.length || 0 }} article{{ (prevision.articlesPrevisions?.length || 0) > 1 ? 's' : '' }}
                </p>
              </div>
              <div class="flex gap-x-2">
                <button 
                  v-if="canEditPrevision"
                  @click="addArticlePrevision(prevision._id)"
                  class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Ajouter un article"
                >
                  <PlusIcon class="h-5 w-5" />
                </button>
                <button 
                  v-if="canEditPrevision"
                  @click="editPrevision(prevision._id)"
                  class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button 
                  @click="viewPrevision(prevision._id)"
                  class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Consulter"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
                <button 
                  v-if="canEditPrevision"
                  @click="confirmDelete(prevision)"
                  class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <!-- Article Previsions -->
            <div v-if="isExpanded(prevision._id) && prevision.articlesPrevisions?.length > 0" class="mt-4 pl-4 border-l-2 border-gray-200">
              <div 
                v-for="articlePrevision in prevision.articlesPrevisions" 
                :key="`${prevision._id}-${articlePrevision._id}`"
                class="py-2 border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="font-medium text-gray-700 text-sm">{{ getArticleInfo(articlePrevision).codeArticle }}</div>
                    <div class="text-gray-600 text-xs">{{ getArticleInfo(articlePrevision).designation }}</div>
                    <div class="text-gray-700 text-sm mt-1">{{ getTotalQuantityForArticle(articlePrevision) }} unités</div>
                  </div>
                  <div class="flex gap-x-1">
                    <button 
                      v-if="canEditPrevision"
                      @click="editArticlePrevision(prevision._id, articlePrevision._id)"
                      class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <PencilSquareIcon class="h-4 w-4" />
                    </button>
                    <button 
                      @click="viewArticlePrevision(prevision._id, articlePrevision._id)"
                      class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                      title="Consulter"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <button 
                      v-if="canEditPrevision"
                      @click="confirmDeleteArticle(prevision, articlePrevision)"
                      class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block overflow-hidden">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                  Campagne
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Fournisseur / Article
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Site / Prévision annuelle
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3 w-32">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <template v-for="prevision in previsions" :key="prevision._id">
                <!-- Main Prevision Row -->
                <tr class="border-b border-gray-200 bg-gray-50">
                  <!-- Campagne -->
                  <td class="py-4 pr-3 text-sm">
                    <div class="flex items-center">
                      <button 
                        v-if="prevision.articlesPrevisions?.length > 0"
                        @click="toggleExpanded(prevision._id)"
                        class="mr-2 p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                        :title="isExpanded(prevision._id) ? 'Réduire' : 'Développer'"
                      >
                        <ChevronRightIcon 
                          class="h-4 w-4 text-gray-500 transition-transform duration-200" 
                          :class="{ 'rotate-90': isExpanded(prevision._id) }"
                        />
                      </button>
                      <div v-else class="w-6 mr-2"></div>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ prevision.campagne }}
                      </span>
                    </div>
                  </td>
                  
                  <!-- Fournisseur + Article Count -->
                  <td class="px-3 py-4 text-sm">
                    <div class="font-medium text-gray-900">{{ prevision.fournisseurId?.nom }}</div>
                    <div class="text-gray-500">({{ prevision.articlesPrevisions?.length || 0 }} article{{ (prevision.articlesPrevisions?.length || 0) > 1 ? 's' : '' }})</div>
                  </td>
                  
                  <!-- Site / Total Units -->
                  <td class="px-3 py-4 text-sm">
                    <div class="text-gray-900">{{ getSiteName(prevision) }}</div>
                    <div class="text-gray-500">({{ getTotalQuantity(prevision) }} unités prévues)</div>
                  </td>
                  
                  <!-- Actions -->
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <div class="flex items-center justify-end gap-x-2">
                      <button 
                        v-if="canEditPrevision"
                        @click="addArticlePrevision(prevision._id)"
                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                        title="Ajouter un article"
                      >
                        <PlusIcon class="h-5 w-5" />
                      </button>
                      <button 
                        v-if="canEditPrevision"
                        @click="editPrevision(prevision._id)"
                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button 
                        @click="viewPrevision(prevision._id)"
                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                        title="Consulter"
                      >
                        <EyeIcon class="h-5 w-5" />
                      </button>
                      <button 
                        v-if="canEditPrevision"
                        @click="confirmDelete(prevision)"
                        class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                
                <!-- Article Prevision Sub-rows -->
                <template v-if="isExpanded(prevision._id) && prevision.articlesPrevisions?.length > 0">
                  <tr 
                    v-for="articlePrevision in prevision.articlesPrevisions" 
                    :key="`${prevision._id}-${articlePrevision._id}`"
                    class="bg-white hover:bg-gray-50 border-b border-gray-100"
                  >
                    <!-- Empty Campagne Column -->
                    <td class="py-3 pr-3 text-sm">
                      <div class="pl-8"></div>
                    </td>
                    
                    <!-- Article Code + Name -->
                    <td class="px-3 py-3 text-sm">
                      <div class="font-medium text-gray-700">{{ getArticleInfo(articlePrevision).codeArticle }}</div>
                      <div class="text-gray-600 text-xs">{{ getArticleInfo(articlePrevision).designation }}</div>
                    </td>
                    
                    <!-- Total Quantities -->
                    <td class="px-3 py-3 text-sm">
                      <div class="text-gray-700 font-medium">{{ getTotalQuantityForArticle(articlePrevision) }} unités</div>
                    </td>
                    
                    <!-- Actions -->
                    <td class="whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <div class="flex items-center justify-end gap-x-2">
                        <button 
                          v-if="canEditPrevision"
                          @click="editArticlePrevision(prevision._id, articlePrevision._id)"
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon class="h-5 w-5" />
                        </button>
                        <button 
                          @click="viewArticlePrevision(prevision._id, articlePrevision._id)"
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                          title="Consulter"
                        >
                          <EyeIcon class="h-5 w-5" />
                        </button>
                        <button 
                          v-if="canEditPrevision"
                          @click="confirmDeleteArticle(prevision, articlePrevision)"
                          class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon class="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && previsions.length === 0" 
             class="text-center py-12">
          <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune prévision</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchQuery || hasActiveFilters ? 'Aucune prévision ne correspond à vos critères.' : 'Commencez par créer votre première prévision.' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6">
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <!-- Results Info -->
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Affichage de 
                <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>
                à 
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
                sur 
                <span class="font-medium">{{ totalItems }}</span>
                résultats
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-700">Afficher:</label>
              <select 
                v-model="itemsPerPage"
                @change="changePageSize"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span class="text-sm text-gray-700">par page</span>
            </div>
            
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button 
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage 
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                
                <button 
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Prevision Slide Panel -->
    <SlidePanel 
      :open="isCreatePanelOpen" 
      @close="closeCreatePanel" 
      title="Créer une nouvelle prévision" 
      size="lg"
    >
      <!-- Form -->
      <form @submit.prevent="handleCreatePrevision" class="space-y-6">
        <!-- Campagne Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Campagne <span class="text-red-500">*</span>
          </label>
          <select
            v-model="createForm.campagne"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sélectionner une campagne</option>
            <option v-for="campagne in availableCampaigns" :key="campagne.value" :value="campagne.value">
              {{ campagne.label }}
            </option>
          </select>
        </div>

        <!-- Fournisseur Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fournisseur <span class="text-red-500">*</span>
          </label>
          <select
            v-model="createForm.fournisseurId"
            @change="onFournisseurChange"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sélectionner un fournisseur</option>
            <option v-for="fournisseur in fournisseurs" 
                    :key="fournisseur._id" 
                    :value="fournisseur._id">
              {{ fournisseur.nom }}
            </option>
          </select>
          <p v-if="selectedFournisseur" class="mt-1 text-sm text-gray-500">
            {{ selectedFournisseur.sites?.length || 0 }} site(s) actif(s)
          </p>
        </div>

        <!-- Site Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Site <span class="text-red-500">*</span>
          </label>
          <select
            v-model="createForm.siteId"
            required
            :disabled="!createForm.fournisseurId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {{ !createForm.fournisseurId ? 'Sélectionner d\'abord un fournisseur' : 'Sélectionner un site' }}
            </option>
            <option v-for="site in availableSites" 
                    :key="site._id" 
                    :value="site._id">
              {{ site.nomSite }} ({{ site.adresse?.ville || 'N/A' }})
            </option>
          </select>
          <p v-if="createForm.fournisseurId && availableSites.length === 0" class="mt-1 text-sm text-red-600">
            Aucun site actif trouvé pour ce fournisseur
          </p>
        </div>

        <!-- Preview Information -->
        <div v-if="createForm.fournisseurId && createForm.siteId && createForm.campagne" 
             class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-blue-900 mb-2">Aperçu de la prévision</h4>
          <div class="text-sm text-blue-800 space-y-1">
            <p><strong>Campagne:</strong> {{ createForm.campagne }}</p>
            <p><strong>Fournisseur:</strong> {{ selectedFournisseur?.nom }}</p>
            <p><strong>Site:</strong> {{ selectedSite?.nomSite }} ({{ selectedSite?.adresse?.ville || 'N/A' }})</p>
            <p><strong>Note:</strong> Vous pourrez ajouter des articles après la création de la prévision</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="createError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
            <span class="text-red-800 text-sm">{{ createError }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            size="md" 
            type="button"
            @click="closeCreatePanel"
            :disabled="isCreating"
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            type="submit"
            :loading="isCreating"
            :disabled="!isFormValid"
          >
            {{ isCreating ? 'Création...' : 'Créer la prévision' }}
          </Button>
        </div>
      </form>
    </SlidePanel>

    <!-- Add Article Prevision Slide Panel -->
    <SlidePanel 
      :open="isAddArticlePanelOpen" 
      @close="closeAddArticlePanel" 
      title="Ajouter un article à la prévision" 
      size="lg"
    >
      <!-- Context Card -->
      <div v-if="selectedPrevisionForArticle" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Contexte de la prévision</h4>
        <div class="text-sm text-blue-800 space-y-1">
          <p><strong>Campagne:</strong> {{ selectedPrevisionForArticle.campagne }}</p>
          <p><strong>Fournisseur:</strong> {{ selectedPrevisionForArticle.fournisseurId?.nom }}</p>
          <p><strong>Site:</strong> {{ getSiteName(selectedPrevisionForArticle) }}</p>
        </div>
      </div>

      <!-- Article Selection Form -->
      <AddArticlePrevisionForm 
        v-if="selectedPrevisionForArticle"
        :prevision="selectedPrevisionForArticle"
        @success="handleArticleAdded"
        @close="closeAddArticlePanel"
      />
    </SlidePanel>
    
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { usePrevisionTreeState } from '../composables/previsions/usePrevisionTreeState';
import previsionsAPI from '../api/previsions';
import api from '../api/axios';
import Button from '../components/ui/Button.vue';
import SlidePanel from '../components/ui/SlidePanel.vue';
import AddArticlePrevisionForm from '../components/previsions/AddArticlePrevisionForm.vue';

// Import icons
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon
} from '@heroicons/vue/24/outline';

export default {
  name: 'PrevisionPage',
  components: {
    Button,
    SlidePanel,
    AddArticlePrevisionForm,
    FunnelIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    ChevronDoubleUpIcon,
    ChevronDoubleDownIcon
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    // Tree state management
    const {
      isExpanded,
      toggleExpanded,
      initializePrevisionTree,
      computedIsTreeExpanded,
      toggleTreeState: baseToggleTreeState,
      handleExpandAll,
      handleCollapseAll
    } = usePrevisionTreeState();

    // Reactive data
    const previsions = ref([]);
    const fournisseurs = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // Search and filters
    const searchQuery = ref('');
    const showFilters = ref(false);
    const filters = ref({
      campagne: '',
      fournisseurId: '',
      status: ''
    });

    // Pagination
    const currentPage = ref(1);
    const totalPages = ref(0);
    const totalItems = ref(0);
    const itemsPerPage = ref(10);
    const hasNextPage = ref(false);
    const hasPrevPage = ref(false);

    // Panel states
    const isCreatePanelOpen = ref(false);
    const isAddArticlePanelOpen = ref(false);
    const selectedPrevisionForArticle = ref(null);
    
    // Create form state
    const createForm = ref({
      campagne: '',
      fournisseurId: '',
      siteId: ''
    });
    
    const isCreating = ref(false);
    const createError = ref(null);

    // Computed properties
    const canCreatePrevision = computed(() => {
      return ['Manager', 'Gestionnaire'].includes(authStore.user?.role);
    });

    const canEditPrevision = computed(() => {
      return ['Manager', 'Gestionnaire'].includes(authStore.user?.role);
    });

    const activeFiltersCount = computed(() => {
      return Object.values(filters.value).filter(value => value !== '').length;
    });

    const hasActiveFilters = computed(() => {
      return activeFiltersCount.value > 0;
    });

    const visiblePages = computed(() => {
      const pages = [];
      const startPage = Math.max(1, currentPage.value - 2);
      const endPage = Math.min(totalPages.value, currentPage.value + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    });

    // Form computed properties
    const selectedFournisseur = computed(() => {
      return fournisseurs.value.find(f => f._id === createForm.value.fournisseurId);
    });

    const selectedSite = computed(() => {
      if (!selectedFournisseur.value || !createForm.value.siteId) return null;
      return selectedFournisseur.value.sites?.find(s => s._id === createForm.value.siteId);
    });

    const availableSites = computed(() => {
      if (!selectedFournisseur.value) return [];
      return selectedFournisseur.value.sites?.filter(s => s.isActive) || [];
    });

    const availableCampaigns = computed(() => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
      
      // If current date is after July 1st, start with current year campaigns
      // Otherwise, start with previous year campaigns
      let startYear;
      if (currentMonth >= 7) {
        // After July 1st: start with current year (e.g., 2025 -> 25-26)
        startYear = currentYear;
      } else {
        // Before July 1st: start with previous year (e.g., 2025 -> 24-25)
        startYear = currentYear - 1;
      }
      
      const campaigns = [];
      for (let i = 0; i < 4; i++) {
        const year1 = startYear + i;
        const year2 = year1 + 1;
        const shortYear1 = (year1 % 100).toString().padStart(2, '0');
        const shortYear2 = (year2 % 100).toString().padStart(2, '0');
        
        campaigns.push({
          value: `${shortYear1}-${shortYear2}`,
          label: `${year1}-${year2}`
        });
      }
      
      return campaigns;
    });

    const isFormValid = computed(() => {
      return createForm.value.campagne && 
             createForm.value.fournisseurId && 
             createForm.value.siteId;
    });

    // Helper methods for display
    const getSiteName = (prevision) => {
      if (!prevision.fournisseurId?.sites || !prevision.siteId) return 'N/A';
      const site = prevision.fournisseurId.sites.find(s => s._id === prevision.siteId);
      return site?.nomSite || 'N/A';
    };

    const getTotalQuantity = (prevision) => {
      if (!prevision.articlesPrevisions) return 0;
      return prevision.articlesPrevisions.reduce((total, ap) => {
        return total + (ap.semaines?.reduce((sum, s) => sum + (s.quantitePrevue || 0), 0) || 0);
      }, 0);
    };

    const getTotalQuantityForArticle = (articlePrevision) => {
      if (!articlePrevision.semaines) return 0;
      return articlePrevision.semaines.reduce((sum, s) => sum + (s.quantitePrevue || 0), 0);
    };

    const getArticleInfo = (articlePrevision) => {
      // This would need to be populated from the backend with article details
      // For now, return placeholder data
      return {
        codeArticle: articlePrevision.articleId?.codeArticle || 'N/A',
        designation: articlePrevision.articleId?.designation || 'Article non trouvé'
      };
    };

    // Methods
    const fetchPrevisions = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const params = {
          page: currentPage.value,
          limit: itemsPerPage.value,
          search: searchQuery.value,
          ...filters.value
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });

        const response = await previsionsAPI.getPrevisions(params);
        
        previsions.value = response.data;
        currentPage.value = response.pagination.currentPage;
        totalPages.value = response.pagination.totalPages;
        totalItems.value = response.pagination.totalItems;
        hasNextPage.value = response.pagination.hasNextPage;
        hasPrevPage.value = response.pagination.hasPrevPage;
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors du chargement des prévisions';
        console.error('Error fetching previsions:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const fetchFournisseurs = async () => {
      try {
        const response = await api.get('/fournisseurs', {
          params: { limit: 1000, status: 'active' }
        });
        fournisseurs.value = response.data.data || [];
      } catch (err) {
        console.error('Error fetching fournisseurs:', err);
      }
    };

    const clearFilters = () => {
      filters.value = {
        campagne: '',
        fournisseurId: '',
        status: ''
      };
      currentPage.value = 1;
      fetchPrevisions();
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Navigation methods
    const viewPrevision = (id) => {
      router.push(`/previsions/${id}`);
    };

    const editPrevision = (id) => {
      router.push(`/previsions/${id}/edit`);
    };

    const addArticlePrevision = (previsionId) => {
      // Find the prevision and open the add article panel
      const prevision = previsions.value.find(p => p._id === previsionId);
      if (prevision) {
        selectedPrevisionForArticle.value = prevision;
        isAddArticlePanelOpen.value = true;
      }
    };

    const closeAddArticlePanel = () => {
      isAddArticlePanelOpen.value = false;
      selectedPrevisionForArticle.value = null;
      // Reset any form state if needed
    };

    const handleArticleAdded = () => {
      // Refresh the previsions list and close the panel
      fetchPrevisions();
      closeAddArticlePanel();
    };

    const viewArticlePrevision = (previsionId, articlePrevisionId) => {
      router.push(`/previsions/${previsionId}/articles/${articlePrevisionId}`);
    };

    const editArticlePrevision = (previsionId, articlePrevisionId) => {
      router.push(`/previsions/${previsionId}/articles/${articlePrevisionId}/edit`);
    };


    const confirmDelete = async (prevision) => {
      const displayName = `${prevision.campagne} - ${prevision.fournisseurId?.nom} - Site ${getSiteName(prevision)}`;
      if (confirm(`Êtes-vous sûr de vouloir supprimer la prévision "${displayName}" ?`)) {
        try {
          await previsionsAPI.deletePrevision(prevision._id);
          fetchPrevisions();
        } catch (err) {
          error.value = err.response?.data?.message || 'Erreur lors de la suppression';
        }
      }
    };

    const confirmDeleteArticle = async (prevision, articlePrevision) => {
      const articleInfo = getArticleInfo(articlePrevision);
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${articleInfo.designation}" de cette prévision ?`)) {
        try {
          await previsionsAPI.removeArticlePrevision(prevision._id, articlePrevision._id);
          fetchPrevisions();
        } catch (err) {
          error.value = err.response?.data?.message || 'Erreur lors de la suppression';
        }
      }
    };

    // Pagination methods
    const goToPage = (page) => {
      currentPage.value = page;
      fetchPrevisions();
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchPrevisions();
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchPrevisions();
      }
    };

    const changePageSize = () => {
      currentPage.value = 1;
      fetchPrevisions();
    };

    // Panel handlers
    const openCreatePanel = () => {
      isCreatePanelOpen.value = true;
      resetCreateForm();
    };

    const closeCreatePanel = () => {
      isCreatePanelOpen.value = false;
      resetCreateForm();
    };

    const resetCreateForm = () => {
      createForm.value = {
        campagne: '',
        fournisseurId: '',
        siteId: ''
      };
      createError.value = null;
    };


    // Form handlers
    const onFournisseurChange = () => {
      // Reset site selection when supplier changes
      createForm.value.siteId = '';
    };

    // Computed tree state
    const isTreeExpanded = computedIsTreeExpanded(previsions);

    // Tree view methods
    const toggleTreeState = () => {
      baseToggleTreeState(previsions.value);
    };

    const handleCreatePrevision = async () => {
      try {
        isCreating.value = true;
        createError.value = null;

        // Build the request data
        const requestData = {
          campagne: createForm.value.campagne,
          fournisseurId: createForm.value.fournisseurId,
          siteId: createForm.value.siteId
        };

        const response = await previsionsAPI.createPrevision(requestData);
        
        // Close panel and refresh list
        closeCreatePanel();
        fetchPrevisions();
        
        // Show success message (you can add a notification system later)
        console.log('Prévision créée avec succès:', response);
        
      } catch (err) {
        createError.value = err.response?.data?.message || 'Erreur lors de la création de la prévision';
        console.error('Error creating prevision:', err);
      } finally {
        isCreating.value = false;
      }
    };

    // Debounced search
    const debouncedFetch = (() => {
      let timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          currentPage.value = 1;
          fetchPrevisions();
        }, 300);
      };
    })();

    // Watchers
    watch(searchQuery, debouncedFetch);
    watch(() => filters.value.campagne, debouncedFetch);
    watch(() => filters.value.fournisseurId, debouncedFetch);
    watch(() => filters.value.status, debouncedFetch);

    // Watch for previsions data changes to initialize tree state
    watch(previsions, (newPrevisions) => {
      if (newPrevisions.length > 0) {
        initializePrevisionTree(newPrevisions);
      }
    }, { immediate: true });

    // Lifecycle
    onMounted(() => {
      fetchPrevisions();
      fetchFournisseurs();
    });

    return {
      // Data
      previsions,
      fournisseurs,
      isLoading,
      error,
      
      // Search and filters
      searchQuery,
      showFilters,
      filters,
      
      // Tree view
      isExpanded,
      isTreeExpanded,
      
      // Pagination
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
      
      // Panels
      isCreatePanelOpen,
      isAddArticlePanelOpen,
      selectedPrevisionForArticle,
      
      // Create form
      createForm,
      isCreating,
      createError,
      
      // Computed
      canCreatePrevision,
      canEditPrevision,
      activeFiltersCount,
      hasActiveFilters,
      visiblePages,
      selectedFournisseur,
      selectedSite,
      availableSites,
      availableCampaigns,
      isFormValid,
      getSiteName,
      getTotalQuantity,
      getTotalQuantityForArticle,
      getArticleInfo,
      
      // Methods
      fetchPrevisions,
      clearFilters,
      formatDate,
      viewPrevision,
      editPrevision,
      addArticlePrevision,
      viewArticlePrevision,
      editArticlePrevision,
      confirmDelete,
      confirmDeleteArticle,
      goToPage,
      previousPage,
      nextPage,
      changePageSize,
      openCreatePanel,
      closeCreatePanel,
      resetCreateForm,
      onFournisseurChange,
      handleCreatePrevision,
      toggleExpanded,
      toggleTreeState,
      closeAddArticlePanel,
      handleArticleAdded
    };
  }
};
</script>
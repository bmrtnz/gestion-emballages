<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// --- STATE PRINCIPAL (LISTE DES ARTICLES) ---
const articles = ref([]);
const isLoading = ref(true);

const columns = [
  { title: 'Code Article', dataIndex: 'codeArticle', key: 'codeArticle', width: 200 },
  { title: 'Désignation', dataIndex: 'designation', key: 'designation' },
  { title: 'Catégorie', dataIndex: 'categorie', key: 'categorie', width: 180 },
  { title: 'Actions', key: 'actions', width: 200, align: 'center' },
];

const fetchArticles = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/articles');
    articles.value = response.data;
  } finally {
    isLoading.value = false;
  }
};

// --- STATE DU DRAWER DE CRÉATION D'ARTICLE ---
const isCreateDrawerVisible = ref(false);
const isSubmitting = ref(false);
const categories = [
  { value: 'Barquette', label: 'Barquette' },
  { value: 'Cagette', label: 'Cagette' },
  { value: 'Plateau', label: 'Plateau' },
  { value: 'Film Plastique', label: 'Film Plastique' },
  { value: 'Autre', label: 'Autre' },
];
const createFormState = reactive({
  codeArticle: '',
  designation: '',
  categorie: null,
});

const showCreateDrawer = () => { isCreateDrawerVisible.value = true; };
const closeCreateDrawer = () => { isCreateDrawerVisible.value = false; };

const handleCreateArticle = async () => {
  isSubmitting.value = true;
  try {
    await api.post('/articles', createFormState);
    message.success('Article créé avec succès !');
    closeCreateDrawer();
    Object.assign(createFormState, { codeArticle: '', designation: '', categorie: null });
    await fetchArticles();
  } catch (err) {
    message.error('Erreur lors de la création de l\'article.');
  } finally {
    isSubmitting.value = false;
  }
};

// --- STATE POUR LE DRAWER DE GESTION DES FOURNISSEURS ---
const isManageDrawerVisible = ref(false);
const editingArticle = ref(null);
const availableSuppliers = ref([]);
const addSupplierForm = reactive({
  fournisseurId: null,
  prixUnitaire: 0,
  referenceFournisseur: ''
});

const openManageDrawer = async (article) => {
  editingArticle.value = article;
  if (availableSuppliers.value.length === 0) {
    try {
      const response = await api.get('/fournisseurs');
      availableSuppliers.value = response.data;
    } catch(err) {
      message.error("Impossible de charger la liste des fournisseurs.");
    }
  }
  isManageDrawerVisible.value = true;
};

const availableSuppliersToLink = computed(() => {
  if (!editingArticle.value || !availableSuppliers.value) return [];
  const linkedSupplierIds = editingArticle.value.fournisseurs.map(f => f.fournisseurId?._id);
  return availableSuppliers.value.filter(s => !linkedSupplierIds.includes(s._id));
});

const closeManageDrawer = () => { isManageDrawerVisible.value = false; };

const handleAddSupplierLink = async () => {
  if (!addSupplierForm.fournisseurId || !addSupplierForm.prixUnitaire) {
    message.warning('Veuillez sélectionner un fournisseur et définir un prix.');
    return;
  }
  try {
    const response = await api.post(`/articles/${editingArticle.value._id}/fournisseurs`, addSupplierForm);
    editingArticle.value = response.data;
    message.success('Fournisseur lié avec succès.');
    addSupplierForm.fournisseurId = null;
    addSupplierForm.prixUnitaire = 0;
    addSupplierForm.referenceFournisseur = '';
    await fetchArticles();
  } catch(err) {
    message.error('Erreur lors de la liaison.');
  }
};

const handleRemoveSupplierLink = async (fournisseurInfoId) => {
    try {
        const response = await api.delete(`/articles/${editingArticle.value._id}/fournisseurs/${fournisseurInfoId}`);
        editingArticle.value = response.data;
        message.success('Lien fournisseur supprimé.');
        await fetchArticles();
    } catch(err) {
        message.error(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
};

// --- STATE POUR LA MODALE D'ÉDITION D'UN LIEN ---
const isEditModalVisible = ref(false);
const editingSupplierLink = ref(null);
const editFormState = reactive({
  prixUnitaire: 0,
  referenceFournisseur: ''
});

const openEditModal = (supplierLink) => {
  editingSupplierLink.value = supplierLink;
  editFormState.prixUnitaire = supplierLink.prixUnitaire;
  editFormState.referenceFournisseur = supplierLink.referenceFournisseur;
  isEditModalVisible.value = true;
};

const handleUpdateSupplierLink = async () => {
    try {
        const response = await api.put(
            `/articles/${editingArticle.value._id}/fournisseurs/${editingSupplierLink.value._id}`,
            editFormState
        );
        editingArticle.value = response.data;
        message.success('Lien fournisseur mis à jour.');
        isEditModalVisible.value = false;
        await fetchArticles();
    } catch(err) {
        message.error('Erreur lors de la mise à jour.');
    }
};

onMounted(fetchArticles);
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h3>Articles</h3>
      <a-button 
        v-if="authStore.userRole === 'Manager' || authStore.userRole === 'Gestionnaire'"
        type="primary" 
        @click="showCreateDrawer"
      >
        Ajouter un Article
      </a-button>
    </div>
    <div class="panel-body">
      <a-table 
        :columns="columns" 
        :data-source="articles" 
        :loading="isLoading"
        row-key="_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-button type="default" size="small" @click="openManageDrawer(record)">
              Gérer les fournisseurs
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>

  <a-drawer
    title="Ajouter un nouvel article"
    :width="500"
    :open="isCreateDrawerVisible"
    @close="closeCreateDrawer"
  >
    <a-form :model="createFormState" layout="vertical">
      <a-form-item label="Code Article" required>
        <a-input v-model:value="createFormState.codeArticle" />
      </a-form-item>
      <a-form-item label="Désignation" required>
        <a-input v-model:value="createFormState.designation" />
      </a-form-item>
      <a-form-item label="Catégorie" required>
        <a-select
          v-model:value="createFormState.categorie"
          placeholder="Sélectionnez une catégorie"
          :options="categories"
        >
        </a-select>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeCreateDrawer">Annuler</a-button>
        <a-button type="primary" @click="handleCreateArticle" :loading="isSubmitting">Créer</a-button>
      </a-space>
    </template>
  </a-drawer>

  <a-drawer
    :title="`Gérer les fournisseurs pour : ${editingArticle?.codeArticle}`"
    :width="600"
    :open="isManageDrawerVisible"
    @close="closeManageDrawer"
    :footer-style="{ textAlign: 'right' }"
  >
    <h4>Fournisseurs associés</h4>
    <a-list :data-source="editingArticle?.fournisseurs" item-layout="horizontal">
        <template #renderItem="{ item }">
            <a-list-item>
                <a-list-item-meta 
                  :title="item.fournisseurId?.nom || 'Fournisseur introuvable'" 
                  :description="`Prix: ${item.prixUnitaire} € - Réf: ${item.referenceFournisseur || 'N/A'}`" 
                />
                <a-space>
                    <a-button type="text" @click="openEditModal(item)"><EditOutlined /></a-button>
                    <a-popconfirm title="Sûr de vouloir supprimer ce lien ?" @confirm="handleRemoveSupplierLink(item._id)">
                        <a-button type="text" danger><DeleteOutlined /></a-button>
                    </a-popconfirm>
                </a-space>
            </a-list-item>
        </template>
        <div v-if="!editingArticle?.fournisseurs?.length" style="color: grey; margin: 20px;">
            Aucun fournisseur n'est encore lié à cet article.
        </div>
    </a-list>
    
    <a-divider />

    <h4>Lier un nouveau fournisseur</h4>
    <a-form :model="addSupplierForm" layout="vertical">
      <a-form-item label="Fournisseur">
        <a-select
          v-model:value="addSupplierForm.fournisseurId"
          placeholder="Sélectionner un fournisseur"
          :options="availableSuppliersToLink.map(f => ({ value: f._id, label: f.nom }))"
          show-search
        />
      </a-form-item>
       <a-form-item label="Référence Fournisseur">
        <a-input v-model:value="addSupplierForm.referenceFournisseur" />
      </a-form-item>
      <a-form-item label="Prix Unitaire (€)">
        <a-input-number
          v-model:value="addSupplierForm.prixUnitaire"
          :min="0"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleAddSupplierLink"><PlusOutlined /> Ajouter ce fournisseur</a-button>
      </a-form-item>
    </a-form>
    <template #footer>
        <a-button @click="closeManageDrawer">Fermer</a-button>
    </template>
  </a-drawer>

  <a-modal
    v-model:open="isEditModalVisible"
    title="Modifier les informations du fournisseur"
    ok-text="Mettre à jour"
    cancel-text="Annuler"
    @ok="handleUpdateSupplierLink"
  >
    <a-form :model="editFormState" layout="vertical" style="margin-top: 24px;">
      <a-form-item label="Référence Fournisseur">
        <a-input v-model:value="editFormState.referenceFournisseur" />
      </a-form-item>
      <a-form-item label="Prix Unitaire (€)">
        <a-input-number
          v-model:value="editFormState.prixUnitaire"
          :min="0"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>
.panel { background-color: #fff; border-radius: 8px; border: 1px solid var(--border-color); }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
h3 { margin: 0; font-size: 1.1rem; }
.panel-body { padding: 1rem; }
</style>
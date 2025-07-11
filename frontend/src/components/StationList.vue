<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// --- Gestion de la liste ---
const stations = ref([]);
const isLoading = ref(true);
const error = ref(null);

const columns = [
  { title: 'Nom', dataIndex: 'nom', key: 'nom' },
  { title: 'Identifiant Interne', dataIndex: 'identifiantInterne', key: 'identifiantInterne' },
  { title: 'Ville', dataIndex: ['adresse', 'ville'], key: 'ville' },
];

const fetchStations = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/stations');
    stations.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des stations.';
  } finally {
    isLoading.value = false;
  }
};

// --- Gestion du Drawer de création ---
const isDrawerVisible = ref(false); // On renomme la variable pour plus de clarté
const isSubmitting = ref(false);
// État initial complet du formulaire
const initialFormState = {
  nom: '',
  identifiantInterne: '',
  adresse: {
    rue: '',
    codePostal: '',
    ville: '',
    pays: 'France', // On peut mettre une valeur par défaut
  },
  contactPrincipal: {
    nom: '',
    email: '',
    telephone: ''
  }
};

// Utiliser reactive pour l'objet du formulaire
const formState = reactive({ ...initialFormState });

const showDrawer = () => {
  // Réinitialiser le formulaire à chaque ouverture
  Object.assign(formState, initialFormState);
  isDrawerVisible.value = true;
};

const closeDrawer = () => {
  isDrawerVisible.value = false;
};

const handleCreateStation = async () => {
  isSubmitting.value = true;
  try {
    await api.post('/stations', formState);
    message.success('Station créée avec succès !');
    closeDrawer();
    await fetchStations(); // Rafraîchir la liste
  } catch (err) {
    message.error('Erreur lors de la création de la station.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchStations);
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h3>Liste des Stations</h3>
      <a-button v-if="authStore.userRole === 'Manager' || authStore.userRole === 'Gestionnaire'" type="primary"
        @click="showDrawer">Ajouter une Station</a-button>
    </div>

    <div class="panel-body">
      <a-table :columns="columns" :data-source="stations" :loading="isLoading" row-key="_id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ville'">
            {{ record.adresse?.ville || 'N/A' }}
          </template>
        </template>
      </a-table>
    </div>
  </div>

  <a-drawer title="Ajouter une nouvelle station" :width="500" :open="isDrawerVisible" @close="closeDrawer">
    <a-form :model="formState" layout="vertical">
      <a-form-item label="Nom de la station" name="nom" :rules="[{ required: true }]">
        <a-input v-model:value="formState.nom" />
      </a-form-item>
      <a-form-item label="Identifiant Interne" name="identifiantInterne" :rules="[{ required: true }]">
        <a-input v-model:value="formState.identifiantInterne" />
      </a-form-item>

      <a-divider>Adresse</a-divider>

      <a-form-item label="Rue">
        <a-input v-model:value="formState.adresse.rue" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Code Postal">
            <a-input v-model:value="formState.adresse.codePostal" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Ville">
            <a-input v-model:value="formState.adresse.ville" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="Pays">
        <a-input v-model:value="formState.adresse.pays" />
      </a-form-item>

      <a-divider>Contact Principal</a-divider>

      <a-form-item label="Nom du contact">
        <a-input v-model:value="formState.contactPrincipal.nom" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Email du contact">
            <a-input v-model:value="formState.contactPrincipal.email" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Téléphone du contact">
            <a-input v-model:value="formState.contactPrincipal.telephone" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="closeDrawer">Annuler</a-button>
        <a-button type="primary" @click="handleCreateStation" :loading="isSubmitting">Créer</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<style scoped>
.panel {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

h3 {
  margin: 0;
  font-size: 1.1rem;
}

.panel-body {
  padding: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border-bottom: 1px solid var(--border-color);
  padding: 1rem;
  text-align: left;
}
th {
  background-color: var(--content-bg);
  color: var(--text-color-light);
  font-size: 0.9rem; /* <-- Police des en-têtes légèrement agrandie */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  font-size: 1rem; /* Assure que la police des cellules est à la taille de base */
}
.error-message {
  color: red;
}
</style>
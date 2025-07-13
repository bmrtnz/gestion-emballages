<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { message } from "ant-design-vue";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();

// --- STATE ---
const fournisseurs = ref([]);
const isLoading = ref(true);

const columns = [
  {
    title: "Nom Fournisseur / Site",
    dataIndex: "nom",
    key: "nom",
    width: "25%",
  },
  {
    title: "SIRET / Principal",
    dataIndex: "siret",
    key: "siret",
    width: "15%",
  },
  { title: "Adresse", key: "adresse", width: "25%" },
  { title: "Contact", key: "contact", width: "20%" },
  { title: "Actions", key: "actions", width: "15%", align: "center" },
];

const tableDataSource = computed(() => {
  return fournisseurs.value.map((fournisseur) => ({
    key: fournisseur._id,
    isParent: true,
    nom: fournisseur.nom,
    siret: fournisseur.siret,
    contact: null,
    ville: "",
    principal: null,
    fullData: fournisseur,
    children: fournisseur.sites.map((site) => ({
      key: site._id,
      isParent: false,
      nom: site.nomSite,
      siret: null,
      principal: site.estPrincipal,
      adresse: site.adresse,
      contact: site.contact,
      fournisseurId: fournisseur._id,
      fullData: site,
    })),
  }));
});

// --- LOGIQUE ---
const fetchFournisseurs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/fournisseurs");
    fournisseurs.value = response.data;
  } finally {
    isLoading.value = false;
  }
};

// State pour le drawer de création de fournisseur
const isCreateDrawerVisible = ref(false);
const isSubmitting = ref(false);
const initialCreateFormState = {
  nom: "",
  siret: "",
  sites: [
    {
      nomSite: "Site Principal",
      estPrincipal: true,
      adresse: { rue: "", codePostal: "", ville: "", pays: "France" },
      contact: { nom: "", email: "", telephone: "" },
    },
  ],
};
const createFormState = reactive({ ...initialCreateFormState });

const showCreateDrawer = () => {
  Object.assign(createFormState, initialCreateFormState);
  isCreateDrawerVisible.value = true;
};
const closeCreateDrawer = () => {
  isCreateDrawerVisible.value = false;
};

// State pour le drawer d'ajout de site
const isAddSiteDrawerVisible = ref(false);
const isSubmittingSite = ref(false);
const editingFournisseurId = ref(null);
const initialAddSiteFormState = {
  nomSite: "",
  estPrincipal: false,
  adresse: { rue: "", codePostal: "", ville: "", pays: "France" },
  contact: { nom: "", email: "", telephone: "" },
};
const addSiteFormState = reactive({ ...initialAddSiteFormState });

const openAddSiteDrawer = (fournisseur) => {
  editingFournisseurId.value = fournisseur.key;
  Object.assign(addSiteFormState, initialAddSiteFormState);
  isAddSiteDrawerVisible.value = true;
};
const closeAddSiteDrawer = () => {
  isAddSiteDrawerVisible.value = false;
};

// State pour le drawer d'édition de site
const isEditSiteDrawerVisible = ref(false);
const isSubmittingEditSite = ref(false);
const editingSite = ref(null);
const editSiteFormState = reactive({
  nomSite: "",
  estPrincipal: false,
  adresse: {},
  contact: {},
});

const openEditSiteDrawer = (fournisseurId, site) => {
  editingFournisseurId.value = fournisseurId;
  editingSite.value = site;
  Object.assign(editSiteFormState, JSON.parse(JSON.stringify(site.fullData)));
  isEditSiteDrawerVisible.value = true;
};
const closeEditSiteDrawer = () => {
  isEditSiteDrawerVisible.value = false;
};

// --- HANDLERS API ---
const handleCreateFournisseur = async () => {
  isSubmitting.value = true;
  try {
    await api.post("/fournisseurs", createFormState);
    message.success("Fournisseur créé avec succès !");
    closeCreateDrawer();
    await fetchFournisseurs();
  } catch (err) {
    message.error("Erreur lors de la création du fournisseur.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCreateSite = async () => {
  isSubmittingSite.value = true;
  try {
    await api.post(
      `/fournisseurs/${editingFournisseurId.value}/sites`,
      addSiteFormState
    );
    message.success("Site ajouté avec succès !");
    closeAddSiteDrawer();
    await fetchFournisseurs();
  } catch (err) {
    message.error("Erreur lors de l'ajout du site.");
  } finally {
    isSubmittingSite.value = false;
  }
};

const handleUpdateSite = async () => {
  isSubmittingEditSite.value = true;
  try {
    await api.put(
      `/fournisseurs/${editingFournisseurId.value}/sites/${editingSite.value.key}`,
      editSiteFormState
    );
    message.success("Site mis à jour avec succès !");
    closeEditSiteDrawer();
    await fetchFournisseurs();
  } catch (err) {
    message.error("Erreur lors de la mise à jour du site.");
  } finally {
    isSubmittingEditSite.value = false;
  }
};

const handleDeleteSite = async (fournisseurId, siteId) => {
  try {
    await api.delete(`/fournisseurs/${fournisseurId}/sites/${siteId}`);
    message.success("Site supprimé avec succès !");
    await fetchFournisseurs();
  } catch (error) {
    message.error(
      error.response?.data?.message || "Erreur lors de la suppression."
    );
  }
};

const handleDeactivateFournisseur = async (fournisseurId) => {
  try {
    await api.delete(`/fournisseurs/${fournisseurId}`);
    message.success("Fournisseur désactivé avec succès.");
    await fetchFournisseurs();
  } catch (error) {
    message.error("Erreur lors de la désactivation du fournisseur.");
  }
};

onMounted(fetchFournisseurs);
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h3>Liste des Fournisseurs</h3>
      <a-button
        v-if="
          authStore.userRole === 'Manager' ||
          authStore.userRole === 'Gestionnaire'
        "
        type="primary"
        @click="showCreateDrawer"
      >
        Ajouter un Fournisseur
      </a-button>
    </div>
    <div class="panel-body">
      <a-table
        :columns="columns"
        :data-source="tableDataSource"
        :loading="isLoading"
        row-key="key"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'nom'">
            <strong v-if="record.isParent">{{ record.nom }}</strong>
            <span v-else>{{ record.nom }}</span>
          </template>

          <template v-if="column.key === 'siret'">
            <span v-if="record.isParent">{{ record.siret }}</span>
            <a-tag v-if="!record.isParent && record.principal" color="green"
              >Oui</a-tag
            >
          </template>

          <template v-if="column.key === 'adresse'">
            <div v-if="!record.isParent && record.adresse">
              <div>{{ record.adresse.rue }}</div>
              <div>
                {{ record.adresse.codePostal }} {{ record.adresse.ville }}
                {{ record.adresse.pays }}
              </div>
            </div>
          </template>

          <template v-if="column.key === 'contact'">
            <div v-if="!record.isParent && record.contact">
              <div>
                {{ record.contact.nom }}
                <span v-if="record.contact.telephone"
                  >({{ record.contact.telephone }})</span
                >
              </div>
              <a :href="`mailto:${record.contact.email}`">{{
                record.contact.email
              }}</a>
            </div>
          </template>

          <template v-if="column.key === 'actions'">
            <a-space v-if="record.isParent">
              <a-button
                type="text"
                size="small"
                @click="openAddSiteDrawer(record)"
              >
                <PlusOutlined />
              </a-button>
              <a-popconfirm
                title="Désactiver ce fournisseur et ses sites ?"
                ok-text="Oui, désactiver"
                cancel-text="Annuler"
                @confirm="handleDeactivateFournisseur(record.key)"
              >
                <a-button type="text" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>

            <a-space v-else>
              <a-button
                type="text"
                size="small"
                @click="openEditSiteDrawer(record.fournisseurId, record)"
              >
                <EditOutlined />
              </a-button>
              <a-popconfirm
                title="Êtes-vous sûr de vouloir supprimer ce site ?"
                ok-text="Oui, supprimer"
                cancel-text="Annuler"
                @confirm="handleDeleteSite(record.fournisseurId, record.key)"
              >
                <a-button type="text" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>

  <a-drawer
    title="Ajouter un nouveau fournisseur"
    :width="500"
    :open="isCreateDrawerVisible"
    @close="closeCreateDrawer"
  >
    <a-form :model="createFormState" layout="vertical">
      <a-form-item label="Nom du fournisseur" required
        ><a-input v-model:value="createFormState.nom"
      /></a-form-item>
      <a-form-item label="N° SIRET"
        ><a-input v-model:value="createFormState.siret"
      /></a-form-item>
      <a-divider>Site Principal</a-divider>
      <a-form-item label="Nom du site" required
        ><a-input v-model:value="createFormState.sites[0].nomSite"
      /></a-form-item>
      <a-form-item label="Nom du contact"
        ><a-input v-model:value="createFormState.sites[0].contact.nom"
      /></a-form-item>
      <a-form-item label="Email du contact"
        ><a-input v-model:value="createFormState.sites[0].contact.email"
      /></a-form-item>
      <a-form-item label="Rue"
        ><a-input v-model:value="createFormState.sites[0].adresse.rue"
      /></a-form-item>
      <a-row :gutter="16">
        <a-col :span="12"
          ><a-form-item label="Code Postal"
            ><a-input
              v-model:value="
                createFormState.sites[0].adresse.codePostal
              " /></a-form-item
        ></a-col>
        <a-col :span="12"
          ><a-form-item label="Ville"
            ><a-input
              v-model:value="
                createFormState.sites[0].adresse.ville
              " /></a-form-item
        ></a-col>
      </a-row>
      <a-form-item label="Pays"
        ><a-input v-model:value="createFormState.sites[0].adresse.pays"
      /></a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeCreateDrawer">Annuler</a-button>
        <a-button
          type="primary"
          @click="handleCreateFournisseur"
          :loading="isSubmitting"
          >Créer</a-button
        >
      </a-space>
    </template>
  </a-drawer>

  <a-drawer
    title="Ajouter un nouveau site"
    :width="500"
    :open="isAddSiteDrawerVisible"
    @close="closeAddSiteDrawer"
  >
    <a-form :model="addSiteFormState" layout="vertical">
      <a-form-item label="Nom du site" required
        ><a-input v-model:value="addSiteFormState.nomSite"
      /></a-form-item>
      <a-form-item
        ><a-checkbox v-model:checked="addSiteFormState.estPrincipal"
          >Définir comme site principal</a-checkbox
        ></a-form-item
      >
      <a-divider>Adresse du Site</a-divider>
      <a-form-item label="Rue"
        ><a-input v-model:value="addSiteFormState.adresse.rue"
      /></a-form-item>
      <a-row :gutter="16">
        <a-col :span="12"
          ><a-form-item label="Code Postal"
            ><a-input
              v-model:value="
                addSiteFormState.adresse.codePostal
              " /></a-form-item
        ></a-col>
        <a-col :span="12"
          ><a-form-item label="Ville"
            ><a-input
              v-model:value="addSiteFormState.adresse.ville" /></a-form-item
        ></a-col>
      </a-row>
      <a-form-item label="Pays"
        ><a-input v-model:value="addSiteFormState.adresse.pays"
      /></a-form-item>
      <a-divider>Contact du Site</a-divider>
      <a-form-item label="Nom du contact"
        ><a-input v-model:value="addSiteFormState.contact.nom"
      /></a-form-item>
      <a-form-item label="Email du contact"
        ><a-input v-model:value="addSiteFormState.contact.email"
      /></a-form-item>
      <a-form-item label="Téléphone du contact"
        ><a-input v-model:value="addSiteFormState.contact.telephone"
      /></a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeAddSiteDrawer">Annuler</a-button>
        <a-button
          type="primary"
          @click="handleCreateSite"
          :loading="isSubmittingSite"
          >Ajouter le site</a-button
        >
      </a-space>
    </template>
  </a-drawer>

  <a-drawer
    v-if="editingSite"
    title="Modifier un site"
    :width="500"
    :open="isEditSiteDrawerVisible"
    @close="closeEditSiteDrawer"
  >
    <a-form :model="editSiteFormState" layout="vertical">
      <a-form-item label="Nom du site" required
        ><a-input v-model:value="editSiteFormState.nomSite"
      /></a-form-item>
      <a-form-item
        ><a-checkbox v-model:checked="editSiteFormState.estPrincipal"
          >Définir comme site principal</a-checkbox
        ></a-form-item
      >
      <a-divider>Adresse du Site</a-divider>
      <a-form-item label="Rue"
        ><a-input v-model:value="editSiteFormState.adresse.rue"
      /></a-form-item>
      <a-row :gutter="16">
        <a-col :span="12"
          ><a-form-item label="Code Postal"
            ><a-input
              v-model:value="
                editSiteFormState.adresse.codePostal
              " /></a-form-item
        ></a-col>
        <a-col :span="12"
          ><a-form-item label="Ville"
            ><a-input
              v-model:value="editSiteFormState.adresse.ville" /></a-form-item
        ></a-col>
      </a-row>
      <a-form-item label="Pays"
        ><a-input v-model:value="editSiteFormState.adresse.pays"
      /></a-form-item>
      <a-divider>Contact du Site</a-divider>
      <a-form-item label="Nom du contact"
        ><a-input v-model:value="editSiteFormState.contact.nom"
      /></a-form-item>
      <a-form-item label="Email du contact"
        ><a-input v-model:value="editSiteFormState.contact.email"
      /></a-form-item>
      <a-form-item label="Téléphone du contact"
        ><a-input v-model:value="editSiteFormState.contact.telephone"
      /></a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeEditSiteDrawer">Annuler</a-button>
        <a-button
          type="primary"
          @click="handleUpdateSite"
          :loading="isSubmittingEditSite"
          >Mettre à jour</a-button
        >
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
  padding: 1rem;
}

:deep(.ant-table-row-level-0) > td {
  background-color: #eef5ff;
  font-weight: 500;
}
:deep(.ant-table-row-level-0):hover > td {
  background-color: #dbeaff !important;
}
</style>

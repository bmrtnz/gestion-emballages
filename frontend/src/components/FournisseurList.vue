<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// --- Gestion de la liste ---
const fournisseurs = ref([]);
const isLoading = ref(true);

const mainColumns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'SIRET', dataIndex: 'siret', key: 'siret' },
    { title: 'Contact Principal', key: 'contact' },
    { title: 'Actions', key: 'actions', width: '150px', align: 'center' },
];

const siteColumns = [
    { title: 'Nom du Site', dataIndex: 'nomSite', key: 'nomSite', width: '25%' }, // <-- Largeur fixe
    { title: 'Adresse', key: 'adresse', width: '30%' }, // <-- Largeur fixe
    { title: 'Contact', dataIndex: ['contact', 'nom'], key: 'contact', width: '25%' }, // <-- Largeur fixe
    { title: 'Principal', dataIndex: 'estPrincipal', key: 'principal', width: '10%' },
    { title: 'Actions', key: 'actions', width: '10%' }, // <-- Largeur fixe
];

const fetchFournisseurs = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/fournisseurs');
        fournisseurs.value = response.data;
    } finally {
        isLoading.value = false;
    }
};

// --- Gestion du Drawer de création de FOURNISSEUR ---
const isCreateDrawerVisible = ref(false);
const isSubmitting = ref(false);
const initialCreateFormState = {
    nom: '',
    siret: '',
    sites: [{
        nomSite: 'Site Principal',
        estPrincipal: true,
        adresse: { rue: '', codePostal: '', ville: '', pays: 'France' },
        contact: { nom: '', email: '', telephone: '' }
    }]
};
const createFormState = reactive({ ...initialCreateFormState });

const showCreateDrawer = () => { isCreateDrawerVisible.value = true; };
const closeCreateDrawer = () => { isCreateDrawerVisible.value = false; };

const handleCreateFournisseur = async () => {
    isSubmitting.value = true;
    try {
        await api.post('/fournisseurs', createFormState);
        message.success('Fournisseur créé avec succès !');
        closeCreateDrawer();
        Object.assign(createFormState, initialCreateFormState); // Réinitialiser
        await fetchFournisseurs();
    } catch (err) {
        message.error('Erreur lors de la création du fournisseur.');
    } finally {
        isSubmitting.value = false;
    }
};

// --- Gestion du Drawer d'ajout de SITE ---
const isAddSiteDrawerVisible = ref(false);
const isSubmittingSite = ref(false);
const editingFournisseurId = ref(null);
const initialAddSiteFormState = {
    nomSite: '',
    estPrincipal: false,
    adresse: { rue: '', codePostal: '', ville: '', pays: 'France' },
    contact: { nom: '', email: '', telephone: '' }
};
const addSiteFormState = reactive({ ...initialAddSiteFormState });

const openAddSiteDrawer = (fournisseur) => {
    editingFournisseurId.value = fournisseur._id;
    Object.assign(addSiteFormState, initialAddSiteFormState); // Réinitialiser
    isAddSiteDrawerVisible.value = true;
};

const closeAddSiteDrawer = () => {
    isAddSiteDrawerVisible.value = false;
};

const handleCreateSite = async () => {
    isSubmittingSite.value = true;
    try {
        await api.post(`/fournisseurs/${editingFournisseurId.value}/sites`, addSiteFormState);
        message.success('Site ajouté avec succès !');
        closeAddSiteDrawer();
        await fetchFournisseurs();
    } catch (err) {
        message.error('Erreur lors de l\'ajout du site.');
    } finally {
        isSubmittingSite.value = false;
    }
};

const handleDeleteSite = async (fournisseurId, siteId) => {
    try {
        await api.delete(`/fournisseurs/${fournisseurId}/sites/${siteId}`);
        message.success('Site supprimé avec succès !');
        await fetchFournisseurs(); // Rafraîchir la liste
    } catch (error) {
        message.error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
};

onMounted(fetchFournisseurs);
</script>

<template>
    <div class="panel">
        <div class="panel-header">
            <h3>Liste des Fournisseurs</h3>
            <a-button v-if="authStore.userRole === 'Manager' || authStore.userRole === 'Gestionnaire'" type="primary"
                @click="showCreateDrawer">
                Ajouter un Fournisseur
            </a-button>
        </div>
        <div class="panel-body">
            <a-table :columns="mainColumns" :data-source="fournisseurs" :loading="isLoading" row-key="_id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'contact'">
                        <span>{{record.sites.find(s => s.estPrincipal)?.contact.nom || 'N/A'}}</span>
                    </template>
                    <template v-if="column.key === 'actions'">
                        <a-button type="default" size="small" @click="openAddSiteDrawer(record)">
                            Ajouter un site
                        </a-button>
                    </template>
                </template>

                <template #expandedRowRender="{ record: fournisseurRecord }">
                    <a-table :columns="siteColumns" :data-source="fournisseurRecord.sites" :pagination="false"
                        row-key="_id" size="small">
                        <template #bodyCell="{ column, record: siteRecord }">
                            <template v-if="column.key === 'adresse'">
                                <span>
                                    {{ siteRecord.adresse?.rue ? `${siteRecord.adresse.rue}, ` : '' }}{{
                                    siteRecord.adresse?.ville || '' }}
                                </span>
                            </template>
                            <template v-if="column.key === 'principal'">
                                <a-tag v-if="siteRecord.estPrincipal" color="green">Oui</a-tag>
                            </template>

                            <template v-if="column.key === 'actions'">
                                <a-popconfirm title="Êtes-vous sûr de vouloir supprimer ce site ?"
                                    ok-text="Oui, supprimer" cancel-text="Annuler"
                                    @confirm="handleDeleteSite(fournisseurRecord._id, siteRecord._id)">
                                    <a-button type="default" danger size="small">
                                        Supprimer
                                    </a-button>
                                </a-popconfirm>
                            </template>
                        </template>
                    </a-table>
                </template>
            </a-table>
        </div>
    </div>

    <a-drawer title="Ajouter un nouveau fournisseur" :width="500" :open="isCreateDrawerVisible"
        @close="closeCreateDrawer">
        <a-form :model="createFormState" layout="vertical">
            <a-form-item label="Nom du fournisseur" required>
                <a-input v-model:value="createFormState.nom" />
            </a-form-item>
            <a-form-item label="N° SIRET">
                <a-input v-model:value="createFormState.siret" />
            </a-form-item>
            <a-divider>Site Principal</a-divider>
            <a-form-item label="Nom du site" required>
                <a-input v-model:value="createFormState.sites[0].nomSite" />
            </a-form-item>
            <a-form-item label="Nom du contact">
                <a-input v-model:value="createFormState.sites[0].contact.nom" />
            </a-form-item>
            <a-form-item label="Email du contact">
                <a-input v-model:value="createFormState.sites[0].contact.email" />
            </a-form-item>
            <a-form-item label="Rue">
                <a-input v-model:value="createFormState.sites[0].adresse.rue" />
            </a-form-item>
            <a-row :gutter="16">
                <a-col :span="12"><a-form-item label="Code Postal"><a-input
                            v-model:value="createFormState.sites[0].adresse.codePostal" /></a-form-item></a-col>
                <a-col :span="12"><a-form-item label="Ville"><a-input
                            v-model:value="createFormState.sites[0].adresse.ville" /></a-form-item></a-col>
            </a-row>
            <a-form-item label="Pays">
                <a-input v-model:value="createFormState.sites[0].adresse.pays" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-space>
                <a-button @click="closeCreateDrawer">Annuler</a-button>
                <a-button type="primary" @click="handleCreateFournisseur" :loading="isSubmitting">Créer</a-button>
            </a-space>
        </template>
    </a-drawer>

    <a-drawer title="Ajouter un nouveau site" :width="500" :open="isAddSiteDrawerVisible" @close="closeAddSiteDrawer">
        <a-form :model="addSiteFormState" layout="vertical">
            <a-form-item label="Nom du site" required>
                <a-input v-model:value="addSiteFormState.nomSite" />
            </a-form-item>
            <a-form-item>
                <a-checkbox v-model:checked="addSiteFormState.estPrincipal">Définir comme site principal</a-checkbox>
            </a-form-item>
            <a-divider>Adresse du Site</a-divider>
            <a-form-item label="Rue">
                <a-input v-model:value="addSiteFormState.adresse.rue" />
            </a-form-item>
            <a-row :gutter="16">
                <a-col :span="12"><a-form-item label="Code Postal"><a-input
                            v-model:value="addSiteFormState.adresse.codePostal" /></a-form-item></a-col>
                <a-col :span="12"><a-form-item label="Ville"><a-input
                            v-model:value="addSiteFormState.adresse.ville" /></a-form-item></a-col>
            </a-row>
            <a-form-item label="Pays">
                <a-input v-model:value="addSiteFormState.adresse.pays" />
            </a-form-item>
            <a-divider>Contact du Site</a-divider>
            <a-form-item label="Nom du contact">
                <a-input v-model:value="addSiteFormState.contact.nom" />
            </a-form-item>
            <a-form-item label="Email du contact">
                <a-input v-model:value="addSiteFormState.contact.email" />
            </a-form-item>
            <a-form-item label="Téléphone du contact">
                <a-input v-model:value="addSiteFormState.contact.telephone" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-space>
                <a-button @click="closeAddSiteDrawer">Annuler</a-button>
                <a-button type="primary" @click="handleCreateSite" :loading="isSubmittingSite">Ajouter le
                    site</a-button>
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
</style>
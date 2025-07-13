<script setup>
import { ref, reactive, onMounted, onActivated, computed } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import {
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import { getStatusTagColor } from "../utils/statusUtils";
import { useDocumentViewerStore } from "../stores/documentViewerStore";

const authStore = useAuthStore();
const router = useRouter();
const documentViewerStore = useDocumentViewerStore();

const commandesGlobales = ref([]);
const isLoading = ref(true);

// Colonnes unifiées pour la vue arborescente
const globalColumns = [
  { title: "Référence", dataIndex: "reference", key: "reference" },
  {
    title: "Entité (Station / Fournisseur)",
    dataIndex: "entityName",
    key: "entity",
  },
  { title: "Statut", dataIndex: "status", key: "status" },
  { title: "Montant HT", dataIndex: "amount", key: "amount", align: "right" },
  { title: "Date / Action", key: "action", width: "200px", align: "center" },
];

// Transformation des données pour le tableau
const tableDataSource = computed(() => {
  return commandesGlobales.value.map((cg) => ({
    key: cg._id,
    isGlobal: true,
    reference: cg.referenceGlobale,
    entityName: cg.stationId?.nom || "N/A",
    status: cg.statutGeneral,
    amount: cg.montantTotalHT,
    date: cg.createdAt,
    children: cg.commandesFournisseurs.map((cf) => ({
      key: cf._id,
      isGlobal: false,
      reference: cf.numeroCommande,
      entityName: cf.fournisseurId?.nom || "N/A",
      status: cf.statut,
      amount: cf.montantTotalHT,
      bonLivraisonUrl: cf.informationsExpedition?.bonLivraisonUrl,
      date: null, // La dernière colonne sera le bouton d'action
    })),
  }));
});

const fetchCommandesGlobales = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/commandes-globales");
    commandesGlobales.value = response.data;
  } catch (err) {
    message.error("Erreur lors du chargement des commandes.");
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteGlobalCommande = async (commandeGlobaleId) => {
  try {
    await api.delete(`/commandes-globales/${commandeGlobaleId}`);
    message.success("Commande globale supprimée avec succès.");
    fetchCommandesGlobales();
  } catch (err) {
    message.error("Erreur lors de la suppression de la commande globale.");
  }
};

const goToCreatePage = () => {
  router.push("/liste-achat");
};

const handleDeleteCommande = async (commandeId) => {
  try {
    await api.delete(`/commandes/${commandeId}`);
    message.success("Commande fournisseur annulée avec succès.");
    fetchCommandesGlobales();
  } catch (err) {
    message.error("Erreur lors de l'annulation de la commande fournisseur.");
  }
};

const isReceptionDrawerVisible = ref(false);
const commandeToReceive = ref(null);
const nonConformiteTypes = [
  { value: "Qualité", label: "Qualité" },
  { value: "Quantité", label: "Quantité" },
  { value: "Délai", label: "Délai" },
  { value: "Respect instructions", label: "Respect instructions" },
  { value: "Incident livreur", label: "Incident livreur" },
  { value: "Autre", label: "Autre" },
];

const receptionFormState = reactive({
  bonLivraisonEmargeUrl: null,
  bonLivraisonEmargeName: null,
  dateReception: null, // Will be set dynamically
  articles: [],
  nonConformites: [],
});

const openReceptionDrawer = async (commande) => {
  try {
    const response = await api.get(`/commandes/${commande.key}`);
    const commandData = response.data;
    commandeToReceive.value = commandData;

    // Find the earliest confirmed delivery date
    const confirmedDates = commandData.articles
      .map((a) =>
        a.dateLivraisonConfirmee ? dayjs(a.dateLivraisonConfirmee) : null
      )
      .filter((d) => d !== null);

    // Set the reception date, defaulting to today if none are found
    receptionFormState.dateReception =
      confirmedDates.length > 0 ? confirmedDates.sort()[0] : dayjs();

    receptionFormState.articles = commandData.articles.map((a) => ({
      ...a,
      quantiteRecue: a.quantiteCommandee,
    }));
    isReceptionDrawerVisible.value = true;
  } catch (err) {
    message.error("Erreur lors du chargement des détails de la commande.");
  }
};

const closeReceptionDrawer = () => {
  isReceptionDrawerVisible.value = false;
  commandeToReceive.value = null;
  Object.assign(receptionFormState, {
    bonLivraisonEmargeUrl: null,
    articles: [],
    nonConformites: [],
  });
};

const handleReception = async () => {
  if (!receptionFormState.bonLivraisonEmargeUrl) {
    message.error("Veuillez uploader le bon de livraison émargé.");
    return;
  }

  const payload = {
    statut: "Réceptionnée",
    articles: receptionFormState.articles.map((a) => ({
      _id: a._id,
      quantiteRecue: a.quantiteRecue,
    })),
    informationsReception: {
      bonLivraisonEmargeUrl: receptionFormState.bonLivraisonEmargeUrl,
      dateReception: receptionFormState.dateReception.toISOString(),
    },
    nonConformitesReception: receptionFormState.nonConformites,
  };

  try {
    await api.put(`/commandes/${commandeToReceive.value._id}/statut`, payload);
    message.success("Commande réceptionnée avec succès.");
    closeReceptionDrawer();
    fetchCommandesGlobales();
  } catch (err) {
    message.error("Erreur lors de la réception de la commande.");
  }
};

const handleUploadChange = (info) => {
  if (info.file.status === "done") {
    receptionFormState.bonLivraisonEmargeUrl = info.file.response.fileKey;
    receptionFormState.bonLivraisonEmargeName = info.file.name;
    message.success(`${info.file.name} uploadé avec succès.`);
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} : échec de l'upload.`);
  }
};

const handleNonConformityPhotoUpload = (info, nonConformity) => {
  if (info.file.status === "done") {
    if (!nonConformity.photosUrl) {
      nonConformity.photosUrl = [];
    }
    nonConformity.photosUrl.push(info.file.response.fileKey);
    message.success(`${info.file.name} uploadé avec succès.`);
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} : échec de l'upload.`);
  }
};

const removeNonConformityPhoto = (nonConformity, index) => {
  nonConformity.photosUrl.splice(index, 1);
};

const formatCurrency = (number) => {
  if (typeof number !== "number") return number;
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

onMounted(fetchCommandesGlobales);
onActivated(fetchCommandesGlobales);
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h3>Suivi des Commandes</h3>
      <a-button
        v-if="authStore.userRole === 'Station'"
        type="default"
        size="small"
        @click="goToCreatePage"
      >
        Aller à ma Liste d'Achat
      </a-button>
    </div>
    <div class="panel-body">
      <a-table
        :columns="globalColumns"
        :data-source="tableDataSource"
        :loading="isLoading"
        row-key="key"
        :expand-row-by-click="true"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'reference'">
            <a-space>
              <span>{{ record.reference }}</span>
              <a
                v-if="record.bonLivraisonUrl"
                @click="
                  documentViewerStore.open(
                    `http://localhost:9000/documents/${record.bonLivraisonUrl}`,
                    `Bon de Livraison - ${record.reference}`
                  )
                "
              >
                <FileTextOutlined />
              </a>
            </a-space>
          </template>
          <template v-if="column.key === 'amount'">
            <strong v-if="record.isGlobal"
              >{{ formatCurrency(record.amount) }} €</strong
            >
            <span v-else>{{ formatCurrency(record.amount) }} €</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusTagColor(record.status)">{{
              record.status
            }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space v-if="record.isGlobal">
              <span>{{ formatDate(record.date) }}</span>
              <a-popconfirm
                title="Êtes-vous sûr de vouloir supprimer cette commande globale et toutes les commandes fournisseurs associées ?"
                ok-text="Oui, supprimer"
                cancel-text="Annuler"
                @confirm="handleDeleteGlobalCommande(record.key)"
              >
                <a-button
                  v-if="
                    authStore.userRole === 'Manager' ||
                    authStore.userRole === 'Gestionnaire'
                  "
                  type="text"
                  danger
                  size="small"
                >
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
            <a-space v-else>
              <a-button
                type="text"
                size="small"
                @click="goToDetail(record.key)"
              >
                <EyeOutlined />
              </a-button>
              <a-button
                v-if="authStore.userRole === 'Station'"
                type="text"
                size="small"
                @click="openReceptionDrawer(record)"
                :disabled="record.status !== 'Expédiée'"
              >
                <CheckSquareOutlined />
              </a-button>
              <a-popconfirm
                v-if="authStore.userRole === 'Station'"
                title="Êtes-vous sûr de vouloir annuler cette commande fournisseur ?"
                ok-text="Oui, annuler"
                cancel-text="Non"
                @confirm="handleDeleteCommande(record.key)"
                :disabled="record.status !== 'Enregistrée'"
              >
                <a-button
                  type="text"
                  danger
                  size="small"
                  :disabled="record.status !== 'Enregistrée'"
                >
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
    :open="isReceptionDrawerVisible"
    title="Réceptionner la commande"
    width="600"
    @close="closeReceptionDrawer"
  >
    <a-form v-if="commandeToReceive" layout="vertical">
      <div class="form-row">
        <label>Date de Réception</label>
        <a-date-picker
          v-model:value="receptionFormState.dateReception"
          :allow-clear="false"
        />
      </div>
      <div class="form-row">
        <label>Bon de Livraison Émargé</label>
        <div class="upload-control-group">
          <a-upload
            name="file"
            action="http://localhost:5000/api/upload"
            :headers="{ Authorization: `Bearer ${authStore.token}` }"
            :max-count="1"
            @change="handleUploadChange"
            :show-upload-list="false"
          >
            <a-button type="text"
              ><UploadOutlined style="color: #1890ff; font-size: 1.2em"
            /></a-button>
          </a-upload>
          <span
            v-if="receptionFormState.bonLivraisonEmargeName"
            class="file-name"
            >{{ receptionFormState.bonLivraisonEmargeName }}</span
          >
          <a-button
            v-if="receptionFormState.bonLivraisonEmargeName"
            @click="resetUpload"
            type="text"
            danger
            size="small"
          >
            <DeleteOutlined />
          </a-button>
        </div>
      </div>

      <a-divider>Quantités Reçues</a-divider>
      <div
        v-for="(article, index) in receptionFormState.articles"
        :key="article._id"
        class="reception-item"
      >
        <span>{{ article.articleId.designation }}</span>
        <a-input-number
          v-model:value="receptionFormState.articles[index].quantiteRecue"
          :min="0"
          style="text-align: left; width: 100%"
        />
      </div>

      <a-divider>Non-Conformités à la réception</a-divider>
      <div
        v-for="(nc, index) in receptionFormState.nonConformites"
        :key="index"
        class="non-conformite-item"
      >
        <div class="non-conformite-header">
          <strong>{{ nc.referenceNC }}</strong>
          <a-button
            @click="receptionFormState.nonConformites.splice(index, 1)"
            type="text"
            danger
            size="small"
          >
            <DeleteOutlined />
          </a-button>
        </div>
        <div class="form-row">
          <label>Article</label>
          <a-select
            v-model:value="nc.articleId"
            placeholder="Sélectionner l'article concerné"
          >
            <a-select-option
              v-for="article in commandeToReceive.articles"
              :key="article._id"
              :value="article.articleId._id"
              >{{ article.articleId.designation }}</a-select-option
            >
          </a-select>
        </div>
        <div class="form-row">
          <label>Type de NC</label>
          <a-select
            v-model:value="nc.type"
            placeholder="Type de non-conformité"
          >
            <a-select-option
              v-for="type in nonConformiteTypes"
              :key="type.value"
              :value="type.value"
              >{{ type.label }}</a-select-option
            >
          </a-select>
        </div>
        <div class="form-row">
          <label>Description</label>
          <a-textarea
            v-model:value="nc.description"
            placeholder="Description de la non-conformité"
          />
        </div>
        <div class="form-row">
          <label>Photos</label>
          <div>
            <a-upload
              name="file"
              action="http://localhost:5000/api/upload"
              :headers="{ Authorization: `Bearer ${authStore.token}` }"
              :multiple="true"
              @change="(info) => handleNonConformityPhotoUpload(info, nc)"
              :show-upload-list="false"
            >
              <a-button type="text"
                ><UploadOutlined style="color: #1890ff" /> Uploader
                photos</a-button
              >
            </a-upload>
            <div class="uploaded-photos">
              <div
                v-for="(photoUrl, photoIndex) in nc.photosUrl"
                :key="photoIndex"
                class="uploaded-photo-item"
              >
                <img
                  :src="`http://localhost:9000/documents/${photoUrl}`"
                  alt="Photo non-conformité"
                  class="photo-thumbnail"
                />
                <a-button
                  @click="removeNonConformityPhoto(nc, photoIndex)"
                  type="text"
                  danger
                  size="small"
                >
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a-button
        @click="
          receptionFormState.nonConformites.push({
            referenceNC: `${commandeToReceive.numeroCommande}-NC-${
              receptionFormState.nonConformites.length + 1
            }`,
            articleId: null,
            type: null,
            description: '',
          })
        "
        type="dashed"
        block
        >+ Ajouter une non-conformité</a-button
      >
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeReceptionDrawer">Annuler</a-button>
        <a-button type="primary" @click="handleReception"
          >Valider la Réception</a-button
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

.upload-control-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-name {
  margin-left: 16px;
  font-style: italic;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-row label {
  width: 180px; /* Fixed width for the label */
  text-align: left;
  padding-right: 16px;
  font-weight: 500;
  flex-shrink: 0; /* Prevent label from shrinking */
}

.form-row .ant-select,
.form-row .ant-input,
.form-row .ant-picker {
  flex: 1; /* Allow them to grow and shrink */
  width: 100%; /* Ensure they fill their flex container */
}

.non-conformite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.non-conformite-item {
  background-color: #fff0f0;
  border: 1px solid #fde2e2;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.comparison-date {
  margin-left: 16px;
  font-style: italic;
  color: #888;
}

.uploaded-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.uploaded-photo-item {
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px;
}

.photo-thumbnail {
  width: 64px;
  height: 64px;
  object-fit: cover;
  margin-right: 8px;
}

:deep(.ant-table-row-level-0) > td {
  background-color: #eef5ff;
  font-weight: 500;
}
:deep(.ant-table-row-level-0):hover > td {
  background-color: #dbeaff !important;
}
</style>

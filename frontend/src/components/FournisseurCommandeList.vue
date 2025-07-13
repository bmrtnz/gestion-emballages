<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import dayjs from "dayjs";
import { message } from "ant-design-vue";
import {
  CheckCircleOutlined,
  SendOutlined,
  UploadOutlined,
  FileTextOutlined,
} from "@ant-design/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import { getStatusTagColor } from "../utils/statusUtils";
import { useDocumentViewerStore } from "../stores/documentViewerStore";

const authStore = useAuthStore();
const documentViewerStore = useDocumentViewerStore();
const commandes = ref([]);
const rawDataSource = ref([]);
const isLoading = ref(true);

const columns = [
  { title: "Commande / Article", dataIndex: "name", key: "name" },
  { title: "Station / Qté", dataIndex: "entity", key: "entity" },
  { title: "Statut / P.U.", dataIndex: "status", key: "status" },
  {
    title: "Montant Total / Total Ligne",
    dataIndex: "amount",
    key: "amount",
    align: "right",
  },
  { title: "Actions", key: "actions", align: "center", width: "120px" },
];

// Met à jour rawDataSource à chaque changement de commandes
watch(commandes, () => {
  rawDataSource.value = commandes.value.map((commande) => ({
    key: commande._id,
    isParent: true,
    name: commande.numeroCommande,
    entity: commande.stationId?.nom || "N/A",
    status: commande.statut,
    amount: commande.montantTotalHT,
    fullData: commande,
    children: commande.articles.map((article) => ({
      key: article._id,
      isParent: false,
      name:
        article.referenceFournisseur ||
        `${article.articleId.codeArticle} - ${article.articleId.designation}`,
      entity: new Intl.NumberFormat("fr-FR").format(article.quantiteCommandee),
      status: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(article.prixUnitaire),
      amount: article.prixUnitaire * article.quantiteCommandee,
    })),
  }));
});

const fetchCommandesFournisseur = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/commandes");
    commandes.value = response.data;
  } catch (err) {
    message.error("Erreur lors du chargement de vos commandes.");
  } finally {
    isLoading.value = false;
  }
};

// --- Drawer Confirmation ---
const isConfirmDrawerVisible = ref(false);
const isSubmittingConfirm = ref(false);
const commandeToConfirm = ref(null);
const confirmFormState = reactive({ articles: [] });

const openConfirmDrawer = (commande) => {
  commandeToConfirm.value = commande;
  confirmFormState.articles = commande.articles.map((article) => ({
    _id: article._id,
    designation:
      article.referenceFournisseur ||
      `${article.articleId.codeArticle} - ${article.articleId.designation}`,
    dateLivraisonConfirmee: article.dateSouhaiteeLivraison
      ? dayjs(article.dateSouhaiteeLivraison)
      : null,
  }));
  isConfirmDrawerVisible.value = true;
};

const closeConfirmDrawer = () => {
  isConfirmDrawerVisible.value = false;
  commandeToConfirm.value = null;
  confirmFormState.articles = [];
};

const handleConfirmCommande = async () => {
  isSubmittingConfirm.value = true;
  try {
    const payload = {
      statut: "Confirmée",
      articles: confirmFormState.articles.map((a) => ({
        _id: a._id,
        dateLivraisonConfirmee: a.dateLivraisonConfirmee
          ? a.dateLivraisonConfirmee.format("YYYY-MM-DD")
          : null,
      })),
    };
    await api.put(`/commandes/${commandeToConfirm.value._id}/statut`, payload);
    message.success("Commande confirmée avec succès !");
    closeConfirmDrawer();
    await fetchCommandesFournisseur();
  } catch (err) {
    message.error("Erreur lors de la confirmation.");
  } finally {
    isSubmittingConfirm.value = false;
  }
};

// --- Drawer Expédition ---
const isShipDrawerVisible = ref(false);
const isSubmittingShipment = ref(false);
const commandeToShip = ref(null);
const shipFormState = reactive({ bonLivraisonUrl: null, transporteur: "" });
const uploadHeaders = {
  Authorization: `Bearer ${authStore.token}`,
};

const openShipDrawer = (commande) => {
  commandeToShip.value = commande;
  shipFormState.bonLivraisonUrl = null;
  shipFormState.transporteur = "";
  isShipDrawerVisible.value = true;
};

const closeShipDrawer = () => {
  isShipDrawerVisible.value = false;
  commandeToShip.value = null;
  shipFormState.bonLivraisonUrl = null;
  shipFormState.transporteur = "";
};

const handleUploadChange = (info) => {
  if (info.file.status === "done") {
    message.success(`${info.file.name} uploadé avec succès.`);
    shipFormState.bonLivraisonUrl = info.file.response.fileKey;
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} : échec de l'upload.`);
  }
};

const handleShipCommande = async () => {
  if (!shipFormState.bonLivraisonUrl) {
    message.error("Veuillez uploader le bon de livraison.");
    return;
  }
  isSubmittingShipment.value = true;
  try {
    const payload = {
      statut: "Expédiée",
      informationsExpedition: {
        bonLivraisonUrl: shipFormState.bonLivraisonUrl,
        transporteur: shipFormState.transporteur,
      },
    };
    await api.put(`/commandes/${commandeToShip.value._id}/statut`, payload);
    message.success("Commande marquée comme expédiée !");
    closeShipDrawer();
    await fetchCommandesFournisseur();
  } catch (err) {
    message.error("Erreur lors de la mise à jour du statut.");
  } finally {
    isSubmittingShipment.value = false;
  }
};

// --- Utilitaires ---
const formatCurrency = (number) => {
  if (typeof number !== "number") return "0,00";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

onMounted(fetchCommandesFournisseur);
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h3>Commandes à Traiter</h3>
    </div>
    <div class="panel-body">
      <a-table
        :columns="columns"
        :data-source="rawDataSource"
        :loading="isLoading"
        row-key="key"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag
              v-if="record.isParent"
              :color="getStatusTagColor(record.status)"
            >
              {{ record.status }}
            </a-tag>
            <span v-else>{{ record.status }}</span>
          </template>
          <template v-if="column.key === 'name'">
            <a-space v-if="record.isParent">
              <strong>{{ record.name }}</strong>
              <a 
                v-if="record.fullData.informationsExpedition?.bonLivraisonUrl"
                @click="documentViewerStore.open(`http://localhost:9000/documents/${record.fullData.informationsExpedition.bonLivraisonUrl}`, `Bon de Livraison - ${record.name}`)"
              >
                <FileTextOutlined />
              </a>
            </a-space>
            <span v-else>{{ record.name }}</span>
          </template>
          <template v-if="column.key === 'amount'">
            <strong v-if="record.isParent">
              {{ formatCurrency(record.amount) }} €
            </strong>
            <span v-else> {{ formatCurrency(record.amount) }} € </span>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space v-if="record.isParent">
              <a-tooltip>
                <template #title>Confirmer la commande</template>
                <a-button
                  type="text"
                  :disabled="record.status !== 'Enregistrée'"
                  @click="openConfirmDrawer(record.fullData)"
                >
                  <CheckCircleOutlined />
                </a-button>
              </a-tooltip>

              <a-tooltip>
                <template #title>Marquer comme expédiée</template>
                <a-button
                  type="text"
                  :disabled="record.status !== 'Confirmée'"
                  @click="openShipDrawer(record.fullData)"
                >
                  <SendOutlined />
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>

  <a-drawer
    :open="isConfirmDrawerVisible"
    title="Confirmer les dates de livraison"
    width="500"
    @close="closeConfirmDrawer"
  >
    <a-form
      v-if="commandeToConfirm"
      :model="confirmFormState"
      layout="vertical"
      style="margin-top: 24px"
    >
      <a-form-item
        v-for="(article, index) in confirmFormState.articles"
        :key="article._id"
        :label="article.designation"
      >
        <a-date-picker
          v-model:value="
            confirmFormState.articles[index].dateLivraisonConfirmee
          "
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeConfirmDrawer">Annuler</a-button>
        <a-button
          type="primary"
          :loading="isSubmittingConfirm"
          @click="handleConfirmCommande"
        >
          Confirmer la Commande
        </a-button>
      </a-space>
    </template>
  </a-drawer>

  <a-drawer
    :open="isShipDrawerVisible"
    title="Expédier la commande"
    width="500"
    @close="closeShipDrawer"
  >
    <a-form v-if="commandeToShip" layout="vertical" style="margin-top: 24px">
      <a-form-item label="Bon de Livraison (obligatoire)">
        <a-upload
          name="file"
          action="http://localhost:5000/api/upload"
          :headers="uploadHeaders"
          :max-count="1"
          @change="handleUploadChange"
        >
          <a-button><UploadOutlined /> Uploader le document</a-button>
        </a-upload>
      </a-form-item>
      <a-form-item label="Transporteur (optionnel)">
        <a-input
          v-model:value="shipFormState.transporteur"
          placeholder="Ex: Chronopost"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeShipDrawer">Annuler</a-button>
        <a-button
          type="primary"
          :loading="isSubmittingShipment"
          @click="handleShipCommande"
        >
          Marquer comme Expédiée
        </a-button>
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
.anticon {
  font-size: 1.2rem;
}

:deep(.ant-table-row-level-0) > td {
  background-color: #eef5ff;
  font-weight: 500;
}
:deep(.ant-table-row-level-0):hover > td {
  background-color: #dbeaff !important;
}
</style>

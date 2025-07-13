<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import { getStatusTagColor } from "../utils/statusUtils";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const commande = ref(null);
const isLoading = ref(true);

const articlesColumns = [
  { title: "Article", key: "article" },
  {
    title: "Quantité Commandée",
    dataIndex: "quantiteCommandee",
    key: "qte",
    align: "right",
  },
  {
    title: "Prix Unitaire HT",
    dataIndex: "prixUnitaire",
    key: "pu",
    align: "right",
  },
  { title: "Total Ligne HT", key: "total", align: "right" },
];

const principalSite = computed(() => {
  if (!commande.value?.fournisseurId?.sites) return null;
  return (
    commande.value.fournisseurId.sites.find((s) => s.estPrincipal) ||
    commande.value.fournisseurId.sites[0]
  );
});

const fetchCommandeDetails = async () => {
  isLoading.value = true;
  try {
    const commandeId = route.params.id;
    const response = await api.get(`/commandes/${commandeId}`);
    commande.value = response.data;
  } catch (error) {
    message.error("Erreur lors du chargement du détail de la commande.");
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (number) => {
  if (typeof number !== "number") return number;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(number);
};

const goBack = () => {
  router.back();
};

onMounted(fetchCommandeDetails);
</script>

<template>
  <div class="page-container">
    <div class="page-header-container">
      <a-button type="text" shape="circle" @click="goBack" class="back-button">
        <ArrowLeftOutlined />
      </a-button>
      <div class="page-header">
        <h1>Détail de la Commande</h1>
      </div>
    </div>

    <div v-if="isLoading" style="text-align: center; margin-top: 50px">
      <a-spin size="large" />
    </div>
    <div v-else-if="!commande">
      <a-result
        status="404"
        title="404"
        sub-title="Désolé, la commande que vous cherchez n'existe pas."
      ></a-result>
    </div>
    <div v-else class="order-document">
      <header class="document-header">
        <div class="header-left">
          <h2>Commande N° {{ commande.numeroCommande }}</h2>
          <p class="meta-info">
            Date :
            {{ new Date(commande.createdAt).toLocaleDateString("fr-FR") }}
          </p>
        </div>
        <div class="header-right">
          <div class="status-tag">
            <span>Statut</span>
            <a-tag :color="getStatusTagColor(commande.statut)">{{
              commande.statut
            }}</a-tag>
          </div>
          <div class="header-actions">
            <a-space>
              <a-button
                v-if="
                  commande.statut === 'Enregistrée' &&
                  authStore.userRole === 'Fournisseur'
                "
                type="primary"
                >Confirmer la Commande</a-button
              >
              <a-button
                v-if="
                  commande.statut === 'Confirmée' &&
                  authStore.userRole === 'Fournisseur'
                "
                type="primary"
                >Marquer comme Expédiée</a-button
              >
              
            </a-space>
          </div>
        </div>
      </header>

      <a-divider />

      <a-row :gutter="32" class="info-section">
        <a-col :span="12">
          <h4>Fournisseur</h4>
          <p v-if="commande.fournisseurId">
            <strong>{{ commande.fournisseurId.nom }}</strong
            ><br />
            <template v-if="principalSite && principalSite.adresse">
              {{ principalSite.adresse.rue }}<br />
              {{ principalSite.adresse.codePostal }}
              {{ principalSite.adresse.ville }}
            </template>
            <template v-else> Adresse non disponible. </template>
          </p>
        </a-col>
        <a-col :span="12">
          <h4>Livrer à</h4>
          <p v-if="commande.stationId">
            <strong>{{ commande.stationId.nom }}</strong
            ><br />
            <template v-if="commande.stationId.adresse">
              {{ commande.stationId.adresse.rue }}<br />
              {{ commande.stationId.adresse.codePostal }}
              {{ commande.stationId.adresse.ville }}
            </template>
            <template v-else> Adresse non disponible. </template>
          </p>
        </a-col>
      </a-row>

      <a-table
        :columns="articlesColumns"
        :data-source="commande.articles"
        :pagination="false"
        row-key="_id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'article'">
            <strong>{{ record.articleId.codeArticle }}</strong
            ><br />
            <span>{{ record.articleId.designation }}</span>
          </template>
          <template v-if="column.key === 'pu'">
            {{ formatCurrency(record.prixUnitaire) }}
          </template>
          <template v-if="column.key === 'total'">
            {{ formatCurrency(record.prixUnitaire * record.quantiteCommandee) }}
          </template>
        </template>
      </a-table>

      <div class="totals-section">
        <a-row>
          <a-col :span="16"></a-col>
          <a-col :span="8">
            <a-row class="total-line">
              <a-col :span="12">Total HT</a-col>
              <a-col :span="12" class="total-value">{{
                formatCurrency(commande.montantTotalHT)
              }}</a-col>
            </a-row>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
}
.page-header-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.back-button {
  font-size: 1.2rem;
}
.page-header h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}
.order-document {
  background: #fff;
  padding: 2rem 3rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  max-width: 1000px;
  margin: auto;
}
.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}
.header-left h2 {
  margin: 0;
  font-size: 1.75rem;
}
.meta-info {
  margin-top: 8px;
  color: var(--text-color-light);
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.status-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.status-tag span {
  color: var(--text-color-light);
}
.header-actions {
  margin-top: 1rem;
}
.info-section {
  margin: 2rem 0;
}
.info-section h4 {
  font-weight: 500;
  color: var(--text-color-light);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.totals-section {
  margin-top: 2rem;
}
.total-line {
  padding: 0.5rem 0;
}
.total-value {
  text-align: right;
  font-weight: 500;
  font-size: 1.1rem;
}
</style>

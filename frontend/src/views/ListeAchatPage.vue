<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import {
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons-vue";
import { storeToRefs } from "pinia";
import api from "../api/axios";
import { useRouter } from "vue-router";
import { useListeAchatStore } from "../stores/listeAchatStore";

const router = useRouter();
const listeAchatStore = useListeAchatStore();

const { activeList: activeListeAchat } = storeToRefs(listeAchatStore);

const availableArticles = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);

const addItemForm = reactive({
  articleId: null,
  fournisseurId: null,
  quantite: 1,
  dateSouhaiteeLivraison: null,
});

const loadInitialData = async () => {
  isLoading.value = true;
  try {
    await listeAchatStore.fetchActiveList();
    if (availableArticles.value.length === 0) {
      const resArticles = await api.get("/articles");
      availableArticles.value = resArticles.data;
    }
  } catch (err) {
    message.error("Erreur lors du chargement des données de la page.");
  } finally {
    isLoading.value = false;
  }
};

const suppliersForSelectedArticle = computed(() => {
  if (!addItemForm.articleId || !availableArticles.value) return [];
  const article = availableArticles.value.find(
    (a) => a._id === addItemForm.articleId
  );
  if (!article) return [];
  return article.fournisseurs
    .filter((f) => f.fournisseurId?._id && f.fournisseurId?.nom)
    .map((f) => ({
      value: f.fournisseurId._id,
      label: `${f.fournisseurId.nom} (${f.prixUnitaire}€)`,
    }));
});

const handleAddItem = async () => {
  if (
    !addItemForm.articleId ||
    !addItemForm.fournisseurId ||
    !addItemForm.quantite ||
    !addItemForm.dateSouhaiteeLivraison
  ) {
    message.warning(
      "Veuillez remplir tous les champs pour ajouter un article."
    );
    return;
  }
  await listeAchatStore.addItem(addItemForm);
  Object.assign(addItemForm, {
    articleId: null,
    fournisseurId: null,
    quantite: 1,
    dateSouhaiteeLivraison: null,
  });
};

const handleRemoveItem = async (itemId) => {
  await listeAchatStore.removeItem(itemId);
};

const confirmAndValidateListe = () => {
  if (
    !activeListeAchat.value?.articles ||
    activeListeAchat.value.articles.length === 0
  ) {
    message.warning("Votre liste d'achat est vide.");
    return;
  }
  Modal.confirm({
    title: "Êtes-vous sûr de vouloir valider cette liste ?",
    content:
      "Cette action créera les commandes fournisseurs correspondantes et la liste sera marquée comme traitée.",
    okText: "Oui, valider et commander",
    cancelText: "Annuler",
    onOk: handleValidateListe,
  });
};

const handleValidateListe = async () => {
  isSubmitting.value = true;
  try {
    await api.post("/listes-achat/validate");
    message.success("Commandes créées avec succès ! Vous allez être redirigé.");
    await listeAchatStore.fetchActiveList();
    router.push("/commandes");
  } catch (err) {
    message.error("Erreur lors de la validation de la liste.");
  } finally {
    isSubmitting.value = false;
  }
};

const getArticleName = (articleId) => {
  const article = availableArticles.value.find((a) => a._id === articleId);
  return article
    ? `${article.codeArticle} - ${article.designation}`
    : "Article inconnu";
};

const getSupplierInfo = (item) => {
  const article = availableArticles.value.find((a) => a._id === item.articleId);
  if (!article) return "";

  const fournisseurInfo = article.fournisseurs.find(
    (f) => f.fournisseurId._id === item.fournisseurId
  );
  if (!fournisseurInfo) return "";

  const nomFournisseur = fournisseurInfo.fournisseurId.nom;
  const refFournisseur = fournisseurInfo.referenceFournisseur
    ? ` (${fournisseurInfo.referenceFournisseur})`
    : "";
  
  const prixUnitaire = formatCurrency(fournisseurInfo.prixUnitaire);

  return `Fournisseur: ${nomFournisseur}${refFournisseur} - ${prixUnitaire} €`;
};

const getLineTotal = (item) => {
  const article = availableArticles.value.find((a) => a._id === item.articleId);
  if (!article) return 0;
  const fournisseurInfo = article.fournisseurs.find(
    (f) => f.fournisseurId._id === item.fournisseurId
  );
  if (!fournisseurInfo) return 0;
  return item.quantite * fournisseurInfo.prixUnitaire;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

const formatNumber = (number) => {
  if (typeof number !== "number") return number;
  return new Intl.NumberFormat("fr-FR").format(number);
};

const formatCurrency = (number) => {
  if (typeof number !== "number") return number;
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const totalAmount = computed(() => {
  if (!activeListeAchat.value?.articles) return 0;

  return activeListeAchat.value.articles.reduce((total, item) => {
    const article = availableArticles.value.find(
      (a) => a._id === item.articleId
    );
    if (!article) return total;
    const fournisseurInfo = article.fournisseurs.find(
      (f) => f.fournisseurId._id === item.fournisseurId
    );
    if (!fournisseurInfo) return total;

    return total + item.quantite * fournisseurInfo.prixUnitaire;
  }, 0);
});

onMounted(loadInitialData);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Ma Liste d'Achat</h1>
      <a-button
        type="primary"
        :loading="isSubmitting"
        @click="confirmAndValidateListe"
      >
        <template #icon><SendOutlined /></template>
        Valider la Liste et Commander
      </a-button>
    </div>

    <a-row :gutter="[32, 32]">
      <a-col :xs="24" :lg="14">
        <div class="panel">
          <div class="panel-header">
            <h3>Articles dans la liste</h3>
            <div class="total-amount">
              <span>Montant Total HT</span>
              <strong>{{ formatCurrency(totalAmount) }} €</strong>
            </div>
          </div>
          <div class="panel-body">
            <a-list
              bordered
              :data-source="activeListeAchat?.articles"
              :loading="isLoading"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <div class="list-item-content">
                    <div class="item-quantity">
                      {{ formatNumber(item.quantite) }}
                    </div>
                    <div class="item-details">
                      <div class="item-title">
                        {{ getArticleName(item.articleId) }}
                      </div>
                      <div class="item-description">
                        {{ getSupplierInfo(item) }}
                      </div>
                      <div class="item-description">
                        Date souhaitée:
                        {{ formatDate(item.dateSouhaiteeLivraison) }}
                      </div>
                    </div>
                    <div class="item-total-price">
                      {{ formatCurrency(getLineTotal(item)) }} €
                    </div>
                  </div>
                  <template #actions>
                    <a-popconfirm
                      title="Retirer cet article ?"
                      @confirm="handleRemoveItem(item._id)"
                    >
                      <a-button type="text" danger size="small"
                        ><DeleteOutlined
                      /></a-button>
                    </a-popconfirm>
                  </template>
                </a-list-item>
              </template>
              <div
                v-if="!activeListeAchat?.articles?.length && !isLoading"
                class="empty-list"
              >
                Votre liste d'achat est vide.
              </div>
            </a-list>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :lg="10">
        <div class="panel">
          <div class="panel-header"><h3>Ajouter un article</h3></div>
          <div class="panel-body">
            <a-form :model="addItemForm" layout="vertical">
              <a-form-item label="Article">
                <a-select
                  v-model:value="addItemForm.articleId"
                  placeholder="Rechercher un article..."
                  show-search
                  :options="
                    availableArticles.map((a) => ({
                      value: a._id,
                      label: `${a.codeArticle} - ${a.designation}`,
                    }))
                  "
                  @change="addItemForm.fournisseurId = null"
                  :filter-option="
                    (input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                  "
                />
              </a-form-item>
              <a-form-item label="Fournisseur">
                <a-select
                  v-model:value="addItemForm.fournisseurId"
                  placeholder="Sélectionner un fournisseur"
                  :options="suppliersForSelectedArticle"
                  :disabled="!addItemForm.articleId"
                />
              </a-form-item>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="Quantité"
                    ><a-input-number
                      v-model:value="addItemForm.quantite"
                      :min="1"
                      style="width: 100%"
                  /></a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Date de livraison souhaitée"
                    ><a-date-picker
                      v-model:value="addItemForm.dateSouhaiteeLivraison"
                      style="width: 100%"
                      placeholder="Choisir une date"
                  /></a-form-item>
                </a-col>
              </a-row>
              <a-button type="dashed" @click="handleAddItem" block
                ><PlusOutlined /> Ajouter à la liste</a-button
              >
            </a-form>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
h1 {
  font-size: 1.5rem;
  font-weight: 500;
}
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
.empty-list {
  padding: 20px;
  text-align: center;
  color: grey;
}
.list-item-content {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
}
.item-quantity {
  flex: 0 0 80px;
  font-size: 1rem;
  font-weight: 500;
  text-align: right;
  padding-right: 1.5rem;
  border-right: 1px solid var(--border-color);
  padding-top: 1px;
}
.item-details {
  flex-grow: 1;
}
.item-title {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 4px;
}
.item-description {
  font-size: 0.9rem;
  color: var(--text-color-light);
}
.item-total-price {
  flex-basis: 120px;
  text-align: right;
  font-weight: 500;
  font-size: 1rem;
  padding-top: 1px;
}
.total-amount {
  text-align: right;
  display: flex;
  flex-direction: column;
}
.total-amount span {
  font-size: 0.8rem;
  color: var(--text-color-light);
}
.total-amount strong {
  font-size: 1.2rem;
  color: var(--primary-color);
}
:deep(.ant-list-item) {
  align-items: flex-start;
}
:deep(.ant-list-item-action) {
  padding-top: 8px;
}
</style>

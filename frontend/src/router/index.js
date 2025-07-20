// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

import LoginPage from "../views/LoginPage.vue";
import DashboardPage from "../components/DashboardPage.vue";
import FournisseurPage from "../views/FournisseurPage.vue";
import ArticlePage from "../views/ArticlePage.vue";
import CommandePage from "../views/CommandePage.vue";
import ListeAchatPage from "../views/ListeAchatPage.vue";
import CommandeDetailPage from "../views/CommandeDetailPage.vue";
import StockPage from "../views/StockPage.vue";
import TransfertPage from "../views/TransfertPage.vue";
import PrevisionPage from "../views/PrevisionPage.vue";
import SitePrevisionViewPage from "../views/SitePrevisionViewPage.vue";
import SupplierPrevisionViewPage from "../views/SupplierPrevisionViewPage.vue";
import WeeklyPrevisionEditPage from "../views/WeeklyPrevisionEditPage.vue";
import ContratPage from "../views/ContratPage.vue";
import StationPage from "../views/StationPage.vue";
import UserPage from "../views/UserPage.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", component: LoginPage },
  {
    path: "/dashboard",
    component: DashboardPage,
    meta: { title: "Tableau de Bord" },
  },
  {
    path: "/fournisseurs",
    component: FournisseurPage,
    meta: { title: "Fournisseurs" },
  },
  {
    path: "/articles",
    component: ArticlePage,
    meta: { title: "Articles" },
  },
  {
    path: "/commandes",
    component: CommandePage,
    meta: { title: "Suivi des Commandes" },
  },
  {
    path: "/liste-achat",
    component: ListeAchatPage,
    meta: { title: "Ma Liste d'Achat" },
  },
  {
    path: "/commandes/:id", // Le :id est un paramètre dynamique
    component: CommandeDetailPage,
    meta: { title: "Détail de la Commande" },
  },
  {
    path: "/stocks",
    component: StockPage,
    meta: { title: "Stocks" },
  },
  {
    path: "/transferts",
    component: TransfertPage,
    meta: { title: "Transferts" },
  },
  {
    path: "/previsions",
    component: PrevisionPage,
    meta: { title: "Prévisions" },
  },
  {
    path: "/previsions/supplier/:fournisseurId/:campagne",
    component: SupplierPrevisionViewPage,
    meta: { title: "Prévisions Fournisseur" },
  },
  {
    path: "/previsions/:id",
    component: SitePrevisionViewPage,
    meta: { title: "Détail de la Prévision" },
  },
  {
    path: "/previsions/:id/articles/:articlePrevisionId/edit",
    component: WeeklyPrevisionEditPage,
    meta: { title: "Édition des Prévisions Hebdomadaires" },
  },
  {
    path: "/contrats",
    component: ContratPage,
    meta: { title: "Contrats Cadre" },
  },
  {
    path: "/stations",
    component: StationPage,
    meta: { title: "Stations" },
  },
  {
    path: "/users",
    component: UserPage,
    meta: { title: "Utilisateurs" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Garde de navigation globale
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.path !== "/login";

  // S'assurer que les infos utilisateur sont chargées si un token existe
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;

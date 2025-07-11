// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

import LoginPage from "../components/LoginPage.vue";
import DashboardPage from "../components/DashboardPage.vue";
import FournisseurPage from "../views/FournisseurPage.vue";
import ArticlePage from "../views/ArticlePage.vue";

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

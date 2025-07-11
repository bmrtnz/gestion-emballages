<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { 
  LogoutOutlined, 
  DashboardOutlined, 
  SwapOutlined, 
  FileTextOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
  LineChartOutlined,
  ContainerOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';

// --- Props et Emits pour le mode responsive ---
defineProps({
  isDrawerMode: Boolean,
  open: Boolean,
});
const emit = defineEmits(['close']);

// --- Store et Router ---
const authStore = useAuthStore();
const router = useRouter();

// --- Définition de tous les liens de menu possibles ---
const allMenuItems = [
  { key: 'dashboard', path: '/dashboard', label: 'Tableau de Bord', icon: DashboardOutlined, roles: ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'] },
  { key: 'commandes', path: '/commandes', label: 'Commandes', icon: FileTextOutlined, roles: ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'] },
  { key: 'transferts', path: '/transferts', label: 'Transferts', icon: SwapOutlined, roles: ['Gestionnaire', 'Station'] },
  { key: 'articles', path: '/articles', label: 'Articles', icon: AppstoreOutlined, roles: ['Manager', 'Gestionnaire', 'Station'] },
  { key: 'fournisseurs', path: '/fournisseurs', label: 'Fournisseurs', icon: ShopOutlined, roles: ['Manager', 'Gestionnaire'] },
  { key: 'stations', path: '/stations', label: 'Stations', icon: TeamOutlined, roles: ['Manager', 'Gestionnaire'] },
  { key: 'previsions', path: '/previsions', label: 'Prévisions', icon: LineChartOutlined, roles: ['Gestionnaire'] },
  { key: 'stocks', path: '/stocks', label: 'Stocks', icon: ContainerOutlined, roles: ['Gestionnaire', 'Station', 'Fournisseur'] },
  { key: 'contrats', path: '/contrats', label: 'Contrats Cadre', icon: SafetyCertificateOutlined, roles: ['Manager', 'Gestionnaire'] },
];

// --- Logique d'affichage ---
const visibleMenuItems = computed(() => {
  if (!authStore.userRole) return [];
  return allMenuItems.filter(item => item.roles.includes(authStore.userRole));
});

const userRoleIcon = computed(() => {
  switch (authStore.userRole) {
    case 'Manager': return CrownOutlined;
    case 'Gestionnaire': return SettingOutlined;
    case 'Fournisseur': return ShopOutlined;
    case 'Station': return TeamOutlined;
    default: return null;
  }
});

const handleLogout = () => {
  authStore.logout();
  emit('close');
};
</script>

<template>
  <nav class="sidebar-desktop">
    <div>
      <div class="sidebar-header">
        <img src="@/assets/favicon.png" alt="Logo" style="width: 40%; height: auto;" />
        <h3>&nbsp;OctoLINK</h3>        
      </div>
      <ul>
        <li v-for="item in visibleMenuItems" :key="item.key">
          <router-link :to="item.path">
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-profile-icon">
          <component :is="userRoleIcon" />
        </div>
        <div class="user-profile-info">
          <span class="user-name">{{ authStore.user?.nomComplet }}</span>
          <span class="user-role">{{ authStore.userRole }}</span>
        </div>
      </div>
      <a-divider style="margin: 8px 0;" />
      <a-button type="text" block @click="handleLogout">
        <template #icon><LogoutOutlined /></template>
        Se déconnecter
      </a-button>
    </div>
  </nav>

  <a-drawer
    v-if="isDrawerMode"
    title="Menu"
    placement="left"
    :open="open"
    @close="emit('close')"
  >
    <ul>
      <li v-for="item in visibleMenuItems" :key="item.key">
        <router-link :to="item.path" @click="emit('close')">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
     <template #footer>
        <div class="user-profile">
           <div class="user-profile-icon">
             <component :is="userRoleIcon" />
           </div>
           <div class="user-profile-info">
             <span class="user-name">{{ authStore.user?.nomComplet }}</span>
             <span class="user-role">{{ authStore.userRole }}</span>
           </div>
        </div>
        <a-divider style="margin: 8px 0;" />
        <a-button type="text" block @click="handleLogout">
            <template #icon><LogoutOutlined /></template>
            Se déconnecter
        </a-button>
    </template>
  </a-drawer>
</template>

<style scoped>
h3 {
  color: rgb(209, 1, 122);
  text-align: center;
}
.sidebar-desktop {
  width: 240px;
  background-color: var(--sidebar-bg);
  height: 100vh;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 1.5rem;
  font-weight: bold;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
ul { 
  list-style: none; 
  padding: 0; 
  margin: 1rem 0; 
}
li a { 
  display: flex; 
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem; 
  color: var(--text-color-light); 
  text-decoration: none; 
  transition: background-color 0.2s; 
}
li a:hover, li a.router-link-exact-active { 
  background-color: var(--content-bg); 
  color: var(--primary-color); 
  font-weight: 500; 
}
.sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
}
.user-profile-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}
.user-profile-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 500;
  line-height: 1.2;
}
.user-role {
  font-size: 0.8rem;
  color: var(--text-color-light);
}
.sidebar-footer .ant-btn {
    color: var(--text-color-light);
    text-align: left;
    height: auto;
    padding: 0.75rem;
}

@media (max-width: 768px) {
  .sidebar-desktop {
    display: none;
  }
}
</style>
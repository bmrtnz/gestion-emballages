<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useListeAchatStore } from "../stores/listeAchatStore";
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue";
import {
    XMarkIcon,
    ChartBarIcon,
    HomeIcon,
    UsersIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon,
    CreditCardIcon,
    HomeModernIcon,
    BuildingStorefrontIcon,
    DocumentDuplicateIcon,
    ArrowLeftOnRectangleIcon,
    RectangleStackIcon,
    ClipboardDocumentCheckIcon,
    ArrowsRightLeftIcon,
    CircleStackIcon,
    DocumentChartBarIcon,
    KeyIcon,
    CubeIcon,
    ShoppingCartIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";

const props = defineProps({
    sidebarOpen: Boolean,
    sidebarCollapsed: {
        type: Boolean,
        default: false
    },
});

const emit = defineEmits(["close-sidebar", "toggle-sidebar-collapse"]);

const authStore = useAuthStore();
const listeAchatStore = useListeAchatStore();

// Computed property for cart items count
const cartItemsCount = computed(() => {
    return listeAchatStore.activeList?.articles?.length || 0;
});

// Computed property for entity name
const entityName = computed(() => {
    const user = authStore.user;
    if (!user) return null;
    
    console.log('User object for entity name:', user);
    
    // Check if entiteDetails is populated (should be for Station/Fournisseur users)
    if (user.entiteDetails?.nom) {
        return user.entiteDetails.nom;
    }
    
    return null;
});

// Computed property for role-based stock URL
const getStockUrl = computed(() => {
  const userRole = authStore.user?.role;
  if (userRole === 'Fournisseur') {
    return '/stocks/supplier';
  } else if (userRole === 'Station') {
    return '/stocks/station';
  } else if (['Gestionnaire', 'Manager'].includes(userRole)) {
    return '/stocks/stations-dashboard';
  }
  return '/stocks';
});

const navigation = computed(() => [
    {
        name: "Tableau de bord",
        href: "/dashboard",
        icon: HomeIcon,
        roles: ["Manager", "Gestionnaire", "Station", "Fournisseur"],
    },
    { name: "Analyses", href: "#", icon: ChartBarIcon, roles: ["Manager", "Gestionnaire"] },
]);

const gestionMenu = computed(() => [
    {
        name: "Commandes",
        href: "/commandes",
        icon: ClipboardDocumentCheckIcon,
        roles: ["Manager", "Gestionnaire", "Station"],
    },
    {
        name: "Transferts",
        href: "/transferts",
        icon: ArrowsRightLeftIcon,
        roles: ["Manager", "Gestionnaire", "Station"],
    },
    { name: "Stocks des stations", href: "/stocks/stations-dashboard", icon: CircleStackIcon, roles: ["Manager", "Gestionnaire"] },
    { name: "Stocks des fournisseurs", href: "/stocks/suppliers-dashboard", icon: CubeIcon, roles: ["Manager", "Gestionnaire"] },
    { name: "Prévisions", href: "/previsions", icon: DocumentChartBarIcon, roles: ["Manager", "Gestionnaire"] },
]);

const parametresMenu = computed(() => [
    { name: "Catalogue des articles", href: "/articles", icon: RectangleStackIcon, roles: ["Manager", "Gestionnaire", "Station"] },
    { name: "Fournisseurs", href: "/fournisseurs", icon: BuildingStorefrontIcon, roles: ["Manager", "Gestionnaire"] },
    { name: "Stations", href: "/stations", icon: HomeModernIcon, roles: ["Manager", "Gestionnaire"] },
    { name: "Utilisateurs", href: "/users", icon: UsersIcon, roles: ["Manager", "Gestionnaire"] },
    { name: "Prévisions", href: "/previsions", icon: DocumentChartBarIcon, roles: ["Station"] },
]);

const stationGestionMenu = computed(() => [
    { name: "Ma liste d'achat", href: "/liste-achat", icon: ShoppingCartIcon, roles: ["Station"] },
    { name: "Mes commandes", href: "/commandes", icon: ClipboardDocumentCheckIcon, roles: ["Station"] },
    { name: "Mes transferts", href: "/transferts", icon: ArrowsRightLeftIcon, roles: ["Station"] },
    { name: "Mes stocks", href: getStockUrl.value, icon: CircleStackIcon, roles: ["Station"] },
]);

const stationParametresMenu = computed(() => [
    { name: "Catalogue des articles", href: "/articles", icon: RectangleStackIcon, roles: ["Station"] },
    { name: "Prévisions", href: "/previsions", icon: DocumentChartBarIcon, roles: ["Station"] },
]);

const fournisseurGestionMenu = computed(() => [
    { name: "Mes commandes", href: "/commandes", icon: ClipboardDocumentCheckIcon, roles: ["Fournisseur"] },
    { name: "Mes stocks", href: getStockUrl.value, icon: CircleStackIcon, roles: ["Fournisseur"] },
]);

const fournisseurParametresMenu = computed(() => [
    { name: "Catalogue des articles", href: "/articles", icon: RectangleStackIcon, roles: ["Fournisseur"] },
    { name: "Prévisions", href: "/previsions", icon: DocumentChartBarIcon, roles: ["Fournisseur"] },
]);

const filterMenu = (menu) => {
    if (!authStore.userRole) return [];
    return menu.filter((item) => item.roles.includes(authStore.userRole));
};

const userInitials = computed(() => {
    const user = authStore.user;
    if (!user || !user.nomComplet) return "??";
    const parts = user.nomComplet.split(" ");
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.nomComplet.substring(0, 2).toUpperCase();
});

const handleLogout = () => {
    authStore.logout();
    emit("close-sidebar");
};

// Load shopping list data when user is authenticated and is a Station
const loadShoppingListData = async () => {
    if (authStore.isAuthenticated && authStore.userRole === 'Station') {
        try {
            await listeAchatStore.fetchActiveList();
        } catch (error) {
            console.error('Error loading shopping list data in sidebar:', error);
        }
    }
};

// Watch for authentication changes and load shopping list for Station users
watch(() => [authStore.isAuthenticated, authStore.userRole], ([isAuth, role]) => {
    if (isAuth && role === 'Station') {
        loadShoppingListData();
    }
}, { immediate: true });

// Load data on mount if already authenticated
onMounted(() => {
    if (authStore.isAuthenticated && authStore.userRole === 'Station') {
        loadShoppingListData();
    }
});
</script>

<template>
    <div>
        <!-- Mobile sidebar -->
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="$emit('close-sidebar')">
                <TransitionChild
                    as="template"
                    enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-gray-900/80" />
                </TransitionChild>

                <div class="fixed inset-0 flex">
                    <TransitionChild
                        as="template"
                        enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full"
                        enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leave-from="translate-x-0"
                        leave-to="-translate-x-full"
                    >
                        <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                            <TransitionChild
                                as="template"
                                enter="ease-in-out duration-300"
                                enter-from="opacity-0"
                                enter-to="opacity-100"
                                leave="ease-in-out duration-300"
                                leave-from="opacity-100"
                                leave-to="opacity-0"
                            >
                                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button type="button" class="-m-2.5 p-2.5" @click="$emit('close-sidebar')">
                                        <span class="sr-only">Close sidebar</span>
                                        <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </TransitionChild>
                            <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                <nav class="flex flex-1 flex-col pt-4">
                                    <!-- User Profile -->
                                    <div class="flex items-center gap-x-4 mb-6">
                                        <div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                                            <span class="text-sm font-medium text-white">{{ userInitials }}</span>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-sm font-semibold text-gray-900">{{ authStore.user?.nomComplet }}</span>
                                            <span class="text-xs text-gray-500">{{ authStore.userRole }}</span>
                                            <span v-if="entityName" class="text-xs text-primary-600">{{ entityName }}</span>
                                        </div>
                                    </div>

                                    <!-- Search -->
                                    <form class="relative mb-6" action="#" method="GET">
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Rechercher..."
                                            class="w-full rounded-md border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                                        </div>
                                    </form>

                                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" class="-mx-2 space-y-1">
                                                <li v-for="item in filterMenu(navigation)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        {{ item.name }}
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li v-if="['Manager', 'Gestionnaire'].includes(authStore.userRole)">
                                            <div class="text-xs font-semibold leading-6 text-gray-400">GESTION</div>
                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in filterMenu(gestionMenu)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        {{ item.name }}
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li v-if="authStore.userRole === 'Station'">
                                            <div class="text-xs font-semibold leading-6 text-gray-400">GESTION</div>
                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in filterMenu(stationGestionMenu)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        <span class="flex-1">{{ item.name }}</span>
                                                        <span 
                                                            v-if="item.name === 'Ma liste d\'achat' && cartItemsCount > 0"
                                                            class="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full"
                                                        >
                                                            {{ cartItemsCount }}
                                                        </span>
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li v-if="['Manager', 'Gestionnaire'].includes(authStore.userRole)">
                                            <div class="text-xs font-semibold leading-6 text-gray-400">PARAMETRES</div>
                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in filterMenu(parametresMenu)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        {{ item.name }}
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li v-if="authStore.userRole === 'Station'">
                                            <div class="text-xs font-semibold leading-6 text-gray-400">PARAMETRES</div>
                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in filterMenu(stationParametresMenu)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        {{ item.name }}
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li v-if="authStore.userRole === 'Fournisseur'">
                                            <div class="text-xs font-semibold leading-6 text-gray-400">GESTION</div>
                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in filterMenu(fournisseurGestionMenu)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        {{ item.name }}
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li v-if="authStore.userRole === 'Fournisseur'">
                                            <div class="text-xs font-semibold leading-6 text-gray-400">PARAMETRES</div>
                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in filterMenu(fournisseurParametresMenu)" :key="item.name">
                                                    <router-link
                                                        :to="item.href"
                                                        :class="[
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                            $route.path === item.href
                                                                ? 'bg-gray-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        ]"
                                                        @click="$emit('close-sidebar')"
                                                    >
                                                        <component
                                                            :is="item.icon"
                                                            :class="[
                                                                'h-6 w-6 shrink-0',
                                                                $route.path === item.href
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                            ]"
                                                            aria-hidden="true"
                                                        />
                                                        {{ item.name }}
                                                    </router-link>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="mt-auto">
                                            <a
                                                @click="handleLogout"
                                                href="#"
                                                class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                                            >
                                                <ArrowLeftOnRectangleIcon
                                                    class="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"
                                                    aria-hidden="true"
                                                />
                                                Se déconnecter
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Static sidebar for desktop -->
        <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300" :class="[sidebarCollapsed ? 'lg:w-16' : 'lg:w-72']">
            <!-- Collapse/Expand Button -->
            <button
                @click="$emit('toggle-sidebar-collapse')"
                class="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
                <ChevronLeftIcon v-if="!sidebarCollapsed" class="h-4 w-4 text-gray-600" />
                <ChevronRightIcon v-else class="h-4 w-4 text-gray-600" />
            </button>
            
            <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white pb-4" :class="[sidebarCollapsed ? 'px-2' : 'px-6']">
                <!-- User Profile -->
                <div class="flex h-16 shrink-0 items-center" :class="[sidebarCollapsed ? 'justify-center' : 'gap-x-4']">
                    <div :class="[
                        'rounded-full bg-primary-600 flex items-center justify-center transition-all duration-300',
                        sidebarCollapsed ? 'h-8 w-8' : 'h-10 w-10'
                    ]">
                        <span :class="[
                            'font-medium text-white transition-all duration-300',
                            sidebarCollapsed ? 'text-xs' : 'text-sm'
                        ]">{{ userInitials }}</span>
                    </div>
                    <div v-if="!sidebarCollapsed" class="flex flex-col">
                        <span class="text-sm font-semibold text-gray-900">{{ authStore.user?.nomComplet }}</span>
                        <span class="text-xs text-gray-500">{{ authStore.userRole }}</span>
                        <span v-if="entityName" class="text-xs text-primary-600">{{ entityName }}</span>
                    </div>
                </div>

                <!-- Search -->
                <form v-if="!sidebarCollapsed" class="relative" action="#" method="GET">
                    <input
                        type="text"
                        name="search"
                        placeholder="Rechercher..."
                        class="w-full rounded-md border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                    </div>
                </form>

                <nav class="flex flex-1 flex-col">
                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" class="-mx-2 space-y-1">
                                <li v-for="item in filterMenu(navigation)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li v-if="['Manager', 'Gestionnaire'].includes(authStore.userRole)">
                            <div v-if="!sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">GESTION</div>
                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                <li v-for="item in filterMenu(gestionMenu)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li v-if="authStore.userRole === 'Station'">
                            <div v-if="!sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">GESTION</div>
                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                <li v-for="item in filterMenu(stationGestionMenu)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold relative',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed" class="flex-1">{{ item.name }}</span>
                                        <span 
                                            v-if="item.name === 'Ma liste d\'achat' && cartItemsCount > 0"
                                            :class="[
                                                'inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full',
                                                sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                                            ]"
                                        >
                                            {{ cartItemsCount }}
                                        </span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li v-if="['Manager', 'Gestionnaire'].includes(authStore.userRole)">
                            <div v-if="!sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">PARAMETRES</div>
                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                <li v-for="item in filterMenu(parametresMenu)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li v-if="authStore.userRole === 'Station'">
                            <div v-if="!sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">PARAMETRES</div>
                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                <li v-for="item in filterMenu(stationParametresMenu)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li v-if="authStore.userRole === 'Fournisseur'">
                            <div v-if="!sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">GESTION</div>
                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                <li v-for="item in filterMenu(fournisseurGestionMenu)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li v-if="authStore.userRole === 'Fournisseur'">
                            <div v-if="!sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">PARAMETRES</div>
                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                <li v-for="item in filterMenu(fournisseurParametresMenu)" :key="item.name">
                                    <router-link
                                        :to="item.href"
                                        :class="[
                                            'group flex rounded-md p-2 text-sm leading-6 font-semibold',
                                            sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                                            $route.path === item.href
                                                ? 'bg-gray-50 text-primary-600'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                        ]"
                                        :title="sidebarCollapsed ? item.name : ''"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="[
                                                'h-6 w-6 shrink-0',
                                                $route.path === item.href
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                            ]"
                                            aria-hidden="true"
                                        />
                                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li class="mt-auto">
                            <a
                                @click="handleLogout"
                                href="#"
                                :class="[
                                    'group -mx-2 flex rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                                    sidebarCollapsed ? 'justify-center' : 'gap-x-3'
                                ]"
                                :title="sidebarCollapsed ? 'Se déconnecter' : ''"
                            >
                                <ArrowLeftOnRectangleIcon
                                    class="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"
                                    aria-hidden="true"
                                />
                                <span v-if="!sidebarCollapsed">Se déconnecter</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

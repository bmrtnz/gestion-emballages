import { computed } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { FournisseurManagementStrategyFactory } from "../../strategies/fournisseurs/FournisseurManagementStrategy";

/**
 * Composable for fournisseur role-based strategy management
 * Provides role-specific behavior and data transformation for supplier management
 */
export function useFournisseurRoleStrategy() {
    const authStore = useAuthStore();

    // Create strategy based on current user's role
    const strategy = computed(() => {
        if (!authStore.user) {
            return FournisseurManagementStrategyFactory.createStrategy("Station");
        }

        return FournisseurManagementStrategyFactory.createStrategy(authStore.user.role, authStore.user._id);
    });

    // Transform data based on strategy
    const transformTableData = (fournisseurs) => {
        if (!strategy.value || !fournisseurs) return [];
        return strategy.value.transformTableData(fournisseurs);
    };

    // Get available filters for current role
    const getAvailableFilters = () => {
        if (!strategy.value) return [];
        return strategy.value.getAvailableFilters();
    };

    // Check if a filter is available for current role
    const isFilterAvailable = (filterName) => {
        const availableFilters = getAvailableFilters();
        return availableFilters.includes(filterName);
    };

    // Get table columns configuration
    const getTableColumns = () => {
        if (!strategy.value) return [];
        return strategy.value.getTableColumns();
    };

    // Get UI behavior configuration
    const getUIBehavior = () => {
        if (!strategy.value) {
            return {
                showCreateButton: false,
                showBulkActions: false,
                showAdvancedFilters: false,
                defaultPageSize: 10,
                enableExport: false,
                showStatusColumn: false,
                allowRowActions: false,
                showSiteManagement: false,
                useTreeView: true,
                showTreeControls: false,
                alwaysExpanded: false,
                defaultExpanded: false
            };
        }
        return strategy.value.getUIBehavior();
    };

    // Get tree view configuration
    const getTreeViewConfig = () => {
        if (!strategy.value) {
            return {
                useTreeView: true,
                showTreeControls: false,
                showExpandButtons: false,
                alwaysExpanded: false,
                defaultExpanded: false
            };
        }
        return strategy.value.getTreeViewConfig();
    };

    // Get permissions for current role
    const getPermissions = () => {
        if (!strategy.value) {
            return {
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canActivate: false,
                canDeactivate: false,
                canExport: false,
                canViewAll: false,
                canViewDetails: true,
                canManageSites: false,
                canCreateSites: false,
                canEditSites: false,
                canDeleteSites: false
            };
        }
        return strategy.value.getPermissions();
    };

    // Get available actions for a specific fournisseur or site
    const getAvailableActions = (item, isParent = true) => {
        if (!strategy.value || !item) return [];
        return strategy.value.getAvailableActions(item, isParent);
    };

    // Check if current user can perform action on target fournisseur/site
    const canPerformAction = (action, target, isParent = true) => {
        if (!strategy.value || !target) return false;
        return strategy.value.canPerformAction(action, target, isParent);
    };

    // Convenience methods for specific permissions
    const canCreateFournisseur = computed(() => {
        const permissions = getPermissions();
        return permissions.canCreate;
    });

    const canEditFournisseur = (fournisseur) => {
        return canPerformAction("edit-fournisseur", fournisseur, true);
    };

    const canDeactivateFournisseur = (fournisseur) => {
        return canPerformAction("deactivate-fournisseur", fournisseur, true);
    };

    const canReactivateFournisseur = (fournisseur) => {
        return canPerformAction("reactivate-fournisseur", fournisseur, true);
    };

    const canManageSites = computed(() => {
        const permissions = getPermissions();
        return permissions.canManageSites;
    });

    const canCreateSites = (fournisseur) => {
        return canPerformAction("add-site", fournisseur, true);
    };

    const canEditSite = (site) => {
        return canPerformAction("edit-site", site, false);
    };

    const canDeleteSite = (site) => {
        return canPerformAction("delete-site", site, false);
    };

    const canExportFournisseurs = computed(() => {
        const permissions = getPermissions();
        return permissions.canExport;
    });

    const canViewAllFournisseurs = computed(() => {
        const permissions = getPermissions();
        return permissions.canViewAll;
    });

    // UI behavior computed properties
    const uiBehavior = computed(() => getUIBehavior());
    const treeViewConfig = computed(() => getTreeViewConfig());

    const showCreateButton = computed(() => uiBehavior.value.showCreateButton);
    const showBulkActions = computed(() => uiBehavior.value.showBulkActions);
    const showAdvancedFilters = computed(() => uiBehavior.value.showAdvancedFilters);
    const defaultPageSize = computed(() => uiBehavior.value.defaultPageSize);
    const enableExport = computed(() => uiBehavior.value.enableExport);
    const showStatusColumn = computed(() => uiBehavior.value.showStatusColumn);
    const allowRowActions = computed(() => uiBehavior.value.allowRowActions);
    const showSiteManagement = computed(() => uiBehavior.value.showSiteManagement);

    // Tree view behavior
    const useTreeView = computed(() => treeViewConfig.value.useTreeView);
    const showTreeControls = computed(() => treeViewConfig.value.showTreeControls);
    const showExpandButtons = computed(() => treeViewConfig.value.showExpandButtons);
    const alwaysExpanded = computed(() => treeViewConfig.value.alwaysExpanded);
    const defaultExpanded = computed(() => treeViewConfig.value.defaultExpanded);

    // Filter availability computed properties
    const showStatusFilter = computed(() => isFilterAvailable("status"));
    const showSearchFilter = computed(() => isFilterAvailable("search"));
    const showSpecialisationFilter = computed(() => isFilterAvailable("specialisation"));

    // Formatting helpers from strategy
    const formatAddress = (adresse) => {
        if (!strategy.value) return '';
        return strategy.value.formatAddress(adresse);
    };

    const formatContact = (fournisseur) => {
        if (!strategy.value) return '';
        return strategy.value.formatContact(fournisseur);
    };

    const formatSpecialisations = (specialisations) => {
        if (!strategy.value) return '';
        return strategy.value.formatSpecialisations(specialisations);
    };

    return {
        // Strategy instance
        strategy,

        // Data transformation
        transformTableData,

        // Filter management
        getAvailableFilters,
        isFilterAvailable,
        showStatusFilter,
        showSearchFilter,
        showSpecialisationFilter,

        // Table configuration
        getTableColumns,

        // UI behavior
        getUIBehavior,
        getTreeViewConfig,
        uiBehavior,
        treeViewConfig,
        showCreateButton,
        showBulkActions,
        showAdvancedFilters,
        defaultPageSize,
        enableExport,
        showStatusColumn,
        allowRowActions,
        showSiteManagement,

        // Tree view behavior
        useTreeView,
        showTreeControls,
        showExpandButtons,
        alwaysExpanded,
        defaultExpanded,

        // Permissions
        getPermissions,
        canCreateFournisseur,
        canEditFournisseur,
        canDeactivateFournisseur,
        canReactivateFournisseur,
        canManageSites,
        canCreateSites,
        canEditSite,
        canDeleteSite,
        canExportFournisseurs,
        canViewAllFournisseurs,

        // Actions
        getAvailableActions,
        canPerformAction,

        // Formatting helpers
        formatAddress,
        formatContact,
        formatSpecialisations
    };
}
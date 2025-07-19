import { computed } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { StationManagementStrategyFactory } from "../../strategies/stations/StationManagementStrategy";

/**
 * Composable for station role-based strategy management
 * Provides role-specific behavior and data transformation for station management
 */
export function useStationRoleStrategy() {
    const authStore = useAuthStore();

    // Create strategy based on current user's role
    const strategy = computed(() => {
        if (!authStore.user) {
            return StationManagementStrategyFactory.createStrategy("Station");
        }

        return StationManagementStrategyFactory.createStrategy(authStore.user.role, authStore.user._id);
    });

    // Transform data based on strategy
    const transformTableData = (stations) => {
        if (!strategy.value || !stations) return [];
        return strategy.value.transformTableData(stations);
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
                allowRowActions: false
            };
        }
        return strategy.value.getUIBehavior();
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
                canViewDetails: true
            };
        }
        return strategy.value.getPermissions();
    };

    // Get available actions for a specific station
    const getAvailableActions = (station) => {
        if (!strategy.value || !station) return [];
        return strategy.value.getAvailableActions(station);
    };

    // Check if current user can perform action on target station
    const canPerformAction = (action, station) => {
        if (!strategy.value || !station) return false;
        return strategy.value.canPerformAction(action, station);
    };

    // Convenience methods for specific permissions
    const canCreateStation = computed(() => {
        const permissions = getPermissions();
        return permissions.canCreate;
    });

    const canEditStation = (station) => {
        return canPerformAction("edit", station);
    };

    const canDeactivateStation = (station) => {
        return canPerformAction("deactivate", station);
    };

    const canReactivateStation = (station) => {
        return canPerformAction("reactivate", station);
    };

    const canExportStations = computed(() => {
        const permissions = getPermissions();
        return permissions.canExport;
    });

    const canViewAllStations = computed(() => {
        const permissions = getPermissions();
        return permissions.canViewAll;
    });

    // UI behavior computed properties
    const uiBehavior = computed(() => getUIBehavior());

    const showCreateButton = computed(() => uiBehavior.value.showCreateButton);
    const showBulkActions = computed(() => uiBehavior.value.showBulkActions);
    const showAdvancedFilters = computed(() => uiBehavior.value.showAdvancedFilters);
    const defaultPageSize = computed(() => uiBehavior.value.defaultPageSize);
    const enableExport = computed(() => uiBehavior.value.enableExport);
    const showStatusColumn = computed(() => uiBehavior.value.showStatusColumn);
    const allowRowActions = computed(() => uiBehavior.value.allowRowActions);

    // Filter availability computed properties
    const showStatusFilter = computed(() => isFilterAvailable("status"));
    const showSearchFilter = computed(() => isFilterAvailable("search"));

    // Formatting helpers from strategy
    const formatAddress = (adresse) => {
        if (!strategy.value) return '';
        return strategy.value.formatAddress(adresse);
    };

    const formatContact = (station) => {
        if (!strategy.value) return '';
        return strategy.value.formatContact(station);
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

        // Table configuration
        getTableColumns,

        // UI behavior
        getUIBehavior,
        uiBehavior,
        showCreateButton,
        showBulkActions,
        showAdvancedFilters,
        defaultPageSize,
        enableExport,
        showStatusColumn,
        allowRowActions,

        // Permissions
        getPermissions,
        canCreateStation,
        canEditStation,
        canDeactivateStation,
        canReactivateStation,
        canExportStations,
        canViewAllStations,

        // Actions
        getAvailableActions,
        canPerformAction,

        // Formatting helpers
        formatAddress,
        formatContact
    };
}
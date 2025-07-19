import { computed } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { UserManagementStrategyFactory } from "../../strategies/users/UserManagementStrategy";

export function useUserRoleStrategy() {
    const authStore = useAuthStore();

    // Create strategy based on current user's role
    const strategy = computed(() => {
        if (!authStore.user) {
            return UserManagementStrategyFactory.createStrategy("Station");
        }

        return UserManagementStrategyFactory.createStrategy(authStore.user.role, authStore.user._id);
    });

    // Transform data based on strategy
    const transformTableData = (users) => {
        if (!strategy.value || !users) return [];
        return strategy.value.transformTableData(users);
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
            };
        }
        return strategy.value.getPermissions();
    };

    // Get available actions for a specific user
    const getAvailableActions = (user) => {
        if (!strategy.value || !user) return [];
        return strategy.value.getAvailableActions(user);
    };

    // Check if current user can perform action on target user
    const canPerformAction = (action, user) => {
        if (!strategy.value || !user) return false;
        return strategy.value.canPerformAction(action, user);
    };

    // Convenience methods for specific permissions
    const canCreateUser = computed(() => {
        const permissions = getPermissions();
        return permissions.canCreate;
    });

    const canEditUser = (user) => {
        return canPerformAction("edit", user);
    };

    const canDeactivateUser = (user) => {
        return canPerformAction("deactivate", user);
    };

    const canReactivateUser = (user) => {
        return canPerformAction("reactivate", user);
    };

    const canExportUsers = computed(() => {
        const permissions = getPermissions();
        return permissions.canExport;
    });

    const canViewAllUsers = computed(() => {
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

    // Filter availability computed properties
    const showStatusFilter = computed(() => isFilterAvailable("status"));
    const showRoleFilter = computed(() => isFilterAvailable("role"));

    return {
        // Strategy instance
        strategy,

        // Data transformation
        transformTableData,

        // Filter management
        getAvailableFilters,
        isFilterAvailable,
        showStatusFilter,
        showRoleFilter,

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

        // Permissions
        getPermissions,
        canCreateUser,
        canEditUser,
        canDeactivateUser,
        canReactivateUser,
        canExportUsers,
        canViewAllUsers,

        // Actions
        getAvailableActions,
        canPerformAction,
    };
}

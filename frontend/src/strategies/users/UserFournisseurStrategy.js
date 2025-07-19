import { UserManagementStrategy } from './BaseUserManagementStrategy';

// Fournisseur strategy - Similar to Station but for suppliers
export class UserFournisseurStrategy extends UserManagementStrategy {
  transformTableData(users) {
    // Suppliers see limited data, mainly other supplier users
    return users
      .filter(user => user.role === 'Fournisseur' || user._id === this.userEntiteId)
      .map(user => ({
        ...user,
        displayRole: this.formatRole(user.role),
        displayEntity: this.formatEntity(user.entiteId),
        displayStatus: user.isActive ? 'Actif' : 'Inactif',
        statusClass: user.isActive 
          ? 'bg-green-50 text-green-700 ring-green-600/20'
          : 'bg-red-50 text-red-700 ring-red-600/20'
      }));
  }

  getAvailableFilters() {
    return [
      'status' // Only status filter for suppliers
    ];
  }

  getTableColumns() {
    return [
      { key: 'nomComplet', label: 'Nom Complet', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'entiteId', label: 'Fournisseur', sortable: false },
      { key: 'isActive', label: 'Statut', sortable: true },
      { key: 'actions', label: 'Actions', sortable: false }
    ];
  }

  getUIBehavior() {
    return {
      showCreateButton: false,
      showBulkActions: false,
      showAdvancedFilters: false,
      defaultPageSize: 10,
      enableExport: false
    };
  }

  getPermissions() {
    return {
      canCreate: false,
      canEdit: false, // Can only edit own profile through different mechanism
      canDelete: false,
      canActivate: false,
      canDeactivate: false,
      canExport: false,
      canViewAll: false // Limited view
    };
  }

  getAvailableActions(user) {
    // Suppliers can only view, no actions on other users
    return user._id === this.userEntiteId ? ['edit'] : [];
  }

  canPerformAction(action, user) {
    // Suppliers can only edit their own profile
    return action === 'edit' && user._id === this.userEntiteId;
  }

  formatRole(role) {
    return 'Fournisseur';
  }

  formatEntity(entiteId) {
    if (!entiteId) return '-';
    return typeof entiteId === 'object' ? entiteId.nom : entiteId;
  }
}
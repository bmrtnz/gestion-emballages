import { UserManagementStrategy } from './BaseUserManagementStrategy';

// Manager strategy - Full access to user management
export class UserManagerStrategy extends UserManagementStrategy {
  transformTableData(users) {
    // Managers see all user data with full details
    return users.map(user => ({
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
      'status',
      'role'
    ];
  }

  getTableColumns() {
    return [
      { key: 'nomComplet', label: 'Nom Complet', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Rôle', sortable: true },
      { key: 'entiteId', label: 'Entité', sortable: false },
      { key: 'isActive', label: 'Statut', sortable: true },
      { key: 'actions', label: 'Actions', sortable: false }
    ];
  }

  getUIBehavior() {
    return {
      showCreateButton: true,
      showBulkActions: true,
      showAdvancedFilters: true,
      defaultPageSize: 25,
      enableExport: true
    };
  }

  getPermissions() {
    return {
      canCreate: true,
      canEdit: true,
      canDelete: false, // Soft delete via deactivation
      canActivate: true,
      canDeactivate: true,
      canExport: true,
      canViewAll: true
    };
  }

  getAvailableActions(user) {
    const actions = ['edit'];
    
    if (user.isActive && user._id !== this.userEntiteId) {
      actions.push('deactivate');
    } else if (!user.isActive) {
      actions.push('reactivate');
    }
    
    return actions;
  }

  canPerformAction(action, user) {
    const permissions = this.getPermissions();
    
    switch (action) {
      case 'edit':
        return permissions.canEdit;
      case 'deactivate':
        return permissions.canDeactivate && user.isActive && user._id !== this.userEntiteId;
      case 'reactivate':
        return permissions.canActivate && !user.isActive;
      case 'create':
        return permissions.canCreate;
      default:
        return false;
    }
  }

  formatRole(role) {
    const roleLabels = {
      'Manager': 'Manager',
      'Gestionnaire': 'Gestionnaire',
      'Station': 'Station',
      'Fournisseur': 'Fournisseur'
    };
    return roleLabels[role] || role;
  }

  formatEntity(entiteId) {
    if (!entiteId) return '-';
    return typeof entiteId === 'object' ? entiteId.nom : entiteId;
  }
}
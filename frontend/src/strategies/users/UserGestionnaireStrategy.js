import { UserManagementStrategy } from './BaseUserManagementStrategy';

// Gestionnaire strategy - Similar to Manager but with some restrictions
export class UserGestionnaireStrategy extends UserManagementStrategy {
  transformTableData(users) {
    // Gestionnaires see all user data with full details (same as Manager for now)
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
      showBulkActions: false, // Gestionnaires have fewer bulk operations than Managers
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
    
    // Gestionnaires might have restrictions on deactivating certain roles
    if (user.isActive && user._id !== this.userEntiteId) {
      // For example, Gestionnaires might not be able to deactivate Managers
      if (user.role !== 'Manager') {
        actions.push('deactivate');
      }
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
        // Gestionnaires cannot deactivate Managers
        return permissions.canDeactivate && 
               user.isActive && 
               user._id !== this.userEntiteId &&
               user.role !== 'Manager';
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
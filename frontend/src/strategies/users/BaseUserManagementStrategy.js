// Base strategy interface for user management role-based behavior
export class UserManagementStrategy {
  constructor(userRole, userEntiteId = null) {
    this.userRole = userRole;
    this.userEntiteId = userEntiteId;
  }

  // Abstract methods to be implemented by concrete strategies
  transformTableData(users) {
    throw new Error('transformTableData method must be implemented');
  }

  getAvailableFilters() {
    throw new Error('getAvailableFilters method must be implemented');
  }

  getTableColumns() {
    throw new Error('getTableColumns method must be implemented');
  }

  getUIBehavior() {
    throw new Error('getUIBehavior method must be implemented');
  }

  getPermissions() {
    throw new Error('getPermissions method must be implemented');
  }

  getAvailableActions(user) {
    throw new Error('getAvailableActions method must be implemented');
  }

  canPerformAction(action, user) {
    throw new Error('canPerformAction method must be implemented');
  }
}
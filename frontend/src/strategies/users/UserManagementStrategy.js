import { UserManagerStrategy } from './UserManagerStrategy';
import { UserGestionnaireStrategy } from './UserGestionnaireStrategy';
import { UserStationStrategy } from './UserStationStrategy';
import { UserFournisseurStrategy } from './UserFournisseurStrategy';

// Factory for creating user management role strategies
export class UserManagementStrategyFactory {
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Manager':
        return new UserManagerStrategy(userRole, userEntiteId);
      case 'Gestionnaire':
        return new UserGestionnaireStrategy(userRole, userEntiteId);
      case 'Station':
        return new UserStationStrategy(userRole, userEntiteId);
      case 'Fournisseur':
        return new UserFournisseurStrategy(userRole, userEntiteId);
      default:
        // Default to Station strategy for unknown roles
        return new UserStationStrategy(userRole, userEntiteId);
    }
  }
}
// frontend/src/strategies/listeAchat/ListeAchatBaseStrategy.js

/**
 * Stratégie de base pour la gestion des listes d'achat
 * Définit l'interface commune pour toutes les stratégies de liste d'achat
 */
export class ListeAchatBaseStrategy {
  constructor(userRole, userEntiteId = null) {
    this.userRole = userRole;
    this.userEntiteId = userEntiteId;
  }
  
  /**
   * Détermine si l'utilisateur peut créer une liste d'achat
   * @returns {boolean}
   */
  canCreateList() {
    throw new Error('canCreateList must be implemented by concrete strategy');
  }
  
  /**
   * Détermine si l'utilisateur peut ajouter des articles à la liste
   * @returns {boolean}
   */
  canAddItems() {
    throw new Error('canAddItems must be implemented by concrete strategy');
  }
  
  /**
   * Détermine si l'utilisateur peut supprimer des articles de la liste
   * @returns {boolean}
   */
  canRemoveItems() {
    throw new Error('canRemoveItems must be implemented by concrete strategy');
  }
  
  /**
   * Détermine si l'utilisateur peut valider la liste (créer des commandes)
   * @returns {boolean}
   */
  canValidateList() {
    throw new Error('canValidateList must be implemented by concrete strategy');
  }
  
  /**
   * Retourne les articles disponibles selon le rôle
   * @param {Array} allArticles - Tous les articles disponibles
   * @returns {Array} Articles filtrés selon le rôle
   */
  getAvailableArticles(allArticles) {
    throw new Error('getAvailableArticles must be implemented by concrete strategy');
  }
  
  /**
   * Retourne les fournisseurs disponibles pour un article selon le rôle
   * @param {Object} article - L'article sélectionné
   * @returns {Array} Fournisseurs disponibles
   */
  getAvailableSuppliers(article) {
    throw new Error('getAvailableSuppliers must be implemented by concrete strategy');
  }
  
  /**
   * Retourne les validations spécifiques au rôle pour l'ajout d'items
   * @param {Object} itemData - Données de l'item à ajouter
   * @returns {Object} { isValid: boolean, errors: Array }
   */
  validateItemAddition(itemData) {
    throw new Error('validateItemAddition must be implemented by concrete strategy');
  }
  
  /**
   * Retourne la configuration de l'interface utilisateur selon le rôle
   * @returns {Object} Configuration UI
   */
  getUIBehavior() {
    throw new Error('getUIBehavior must be implemented by concrete strategy');
  }
  
  /**
   * Transforme les données de la liste pour l'affichage selon le rôle
   * @param {Object} listeData - Données de la liste d'achat
   * @returns {Object} Données transformées
   */
  transformListData(listeData) {
    throw new Error('transformListData must be implemented by concrete strategy');
  }
  
  /**
   * Retourne les actions disponibles pour un item selon le rôle
   * @param {Object} item - Item de la liste
   * @returns {Array} Actions disponibles
   */
  getItemActions(item) {
    throw new Error('getItemActions must be implemented by concrete strategy');
  }
}
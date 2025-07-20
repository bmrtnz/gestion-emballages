// frontend/src/api/previsions.js
import api from './axios';

/**
 * Service API pour la gestion des prévisions
 */
export const previsionsAPI = {
  /**
   * Récupérer toutes les prévisions avec pagination et filtres
   * @param {Object} params - Paramètres de la requête
   * @param {number} params.page - Numéro de la page
   * @param {number} params.limit - Nombre d'éléments par page
   * @param {string} params.search - Terme de recherche
   * @param {string} params.campagne - Filtrer par campagne
   * @param {string} params.fournisseurId - Filtrer par fournisseur
   * @param {string} params.articleId - Filtrer par article
   * @returns {Promise} Réponse avec les prévisions paginées
   */
  async getPrevisions(params = {}) {
    const response = await api.get('/previsions', { params });
    return response.data;
  },

  /**
   * Récupérer une prévision par son ID
   * @param {string} id - ID de la prévision
   * @returns {Promise} Réponse avec la prévision complète
   */
  async getPrevisionById(id) {
    const response = await api.get(`/previsions/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle prévision
   * @param {Object} data - Données de la prévision
   * @param {string} data.campagne - Campagne (ex: "25-26")
   * @param {string} data.fournisseurId - ID du fournisseur
   * @param {string} data.siteId - ID du site
   * @returns {Promise} Réponse avec la prévision créée
   */
  async createPrevision(data) {
    const response = await api.post('/previsions', data);
    return response.data;
  },

  /**
   * Ajouter une prévision d'article à une prévision
   * @param {string} id - ID de la prévision
   * @param {Object} data - Données de la prévision d'article
   * @param {string} data.articleId - ID de l'article
   * @param {number} data.annee - Année
   * @param {Array} data.semaines - Prévisions par semaine
   * @returns {Promise} Réponse avec la prévision mise à jour
   */
  async addArticlePrevision(id, data) {
    const response = await api.post(`/previsions/${id}/articles`, data);
    return response.data;
  },

  /**
   * Mettre à jour une prévision d'article
   * @param {string} id - ID de la prévision
   * @param {string} articlePrevisionId - ID de la prévision d'article
   * @param {Object} data - Données de mise à jour
   * @param {Array} data.semaines - Nouvelles prévisions par semaine
   * @returns {Promise} Réponse avec la prévision mise à jour
   */
  async updateArticlePrevision(id, articlePrevisionId, data) {
    const response = await api.put(`/previsions/${id}/articles/${articlePrevisionId}`, data);
    return response.data;
  },

  /**
   * Supprimer une prévision
   * @param {string} id - ID de la prévision
   * @returns {Promise} Réponse de confirmation
   */
  async deletePrevision(id) {
    const response = await api.delete(`/previsions/${id}`);
    return response.data;
  },

  /**
   * Supprimer une prévision d'article
   * @param {string} id - ID de la prévision
   * @param {string} articlePrevisionId - ID de la prévision d'article
   * @returns {Promise} Réponse avec la prévision mise à jour
   */
  async removeArticlePrevision(id, articlePrevisionId) {
    const response = await api.delete(`/previsions/${id}/articles/${articlePrevisionId}`);
    return response.data;
  },

  /**
   * Récupérer toutes les prévisions d'un fournisseur pour une campagne
   * @param {string} fournisseurId - ID du fournisseur
   * @param {string} campagne - Campagne (ex: "25-26")
   * @returns {Promise} Réponse avec toutes les prévisions du fournisseur
   */
  async getSupplierPrevisions(fournisseurId, campagne) {
    const response = await api.get(`/previsions/supplier/${fournisseurId}/${campagne}`);
    return response.data;
  }
};

export default previsionsAPI;
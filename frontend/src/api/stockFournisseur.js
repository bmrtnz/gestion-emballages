/**
 * @fileoverview API client for supplier stock operations
 * @module api/stockFournisseur
 */

import api from './axios';

/**
 * API client for supplier stock management
 * Handles all HTTP requests related to supplier stocks
 */
const stockFournisseurAPI = {
  /**
   * Submit stock inventory for a supplier site
   * @param {Object} inventoryData - Stock inventory data
   * @param {string} inventoryData.fournisseurId - Supplier ID (required for managers)
   * @param {string} inventoryData.siteId - Site ID
   * @param {string} inventoryData.campagne - Campaign (format "25-26")
   * @param {Array} inventoryData.stocks - Array of stock items (optional for initial creation)
   * @returns {Promise<Object>} API response
   */
  async submitStock(inventoryData) {
    const response = await api.post('/stocks-fournisseurs', inventoryData);
    return response.data;
  },

  /**
   * Get all stocks for a supplier (all sites)
   * @param {string} supplierId - Supplier ID
   * @returns {Promise<Object>} API response with stocks grouped by site
   */
  async getAllSiteStocks(supplierId) {
    const response = await api.get(`/stocks-fournisseurs/fournisseurs/${supplierId}`);
    return response.data;
  },

  /**
   * Get stock for a specific supplier site
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @returns {Promise<Object>} API response with site stock details
   */
  async getSiteStock(supplierId, siteId) {
    const response = await api.get(`/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}`);
    return response.data;
  },

  /**
   * Update stock quantity for a specific article
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} articleId - Article ID
   * @param {Object} updateData - Update data
   * @param {number} updateData.quantite - New quantity
   * @returns {Promise<Object>} API response
   */
  async updateArticleStock(supplierId, siteId, articleId, updateData) {
    const response = await api.put(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/articles/${articleId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Delete an article from stock
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} API response
   */
  async deleteArticleFromStock(supplierId, siteId, articleId) {
    const response = await api.delete(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/articles/${articleId}`
    );
    return response.data;
  },

  /**
   * Update weekly stock for a specific article and campaign
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} articleId - Article ID
   * @param {Object} weeklyData - Weekly stock data
   * @param {string} weeklyData.campagne - Campaign (format "25-26")
   * @param {number} weeklyData.numeroSemaine - Week number (1-52)
   * @param {number} weeklyData.quantite - Stock quantity
   * @returns {Promise<Object>} API response
   */
  async updateWeeklyStock(supplierId, siteId, articleId, weeklyData) {
    const response = await api.put(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/articles/${articleId}/weekly`,
      weeklyData
    );
    return response.data;
  },

  /**
   * Get campaign history for a specific article
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} articleId - Article ID
   * @param {string} campaign - Campaign (format "25-26")
   * @returns {Promise<Object>} API response with weekly history and statistics
   */
  async getArticleCampaignHistory(supplierId, siteId, articleId, campaign) {
    const response = await api.get(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/articles/${articleId}/campaigns/${campaign}/history`
    );
    return response.data;
  },

  /**
   * Get stock statistics for a campaign
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} campaign - Campaign (format "25-26")
   * @returns {Promise<Object>} API response with detailed statistics by article and quarter
   */
  async getCampaignStockStats(supplierId, siteId, campaign) {
    const response = await api.get(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/campaigns/${campaign}/stats`
    );
    return response.data;
  },

  /**
   * Bulk update multiple article stocks
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {Array} bulkData - Array of stock updates
   * @param {string} bulkData[].articleId - Article ID
   * @param {number} bulkData[].quantite - New quantity
   * @returns {Promise<Array>} Array of API responses
   */
  async bulkUpdateArticleStocks(supplierId, siteId, bulkData) {
    const updatePromises = bulkData.map(item =>
      this.updateArticleStock(supplierId, siteId, item.articleId, { quantite: item.quantite })
    );
    
    return Promise.all(updatePromises);
  },

  /**
   * Update complete weekly stock (all articles for a week)
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {Object} weeklyData - Weekly stock data
   * @param {string} weeklyData.campagne - Campaign (format "25-26")
   * @param {number} weeklyData.numeroSemaine - Week number (1-52)
   * @param {Array} weeklyData.articles - Array of articles with quantities
   * @returns {Promise<Object>} API response
   */
  async updateCompleteWeeklyStock(supplierId, siteId, weeklyData) {
    const response = await api.put(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/weekly`,
      weeklyData
    );
    return response.data;
  },

  /**
   * Get weekly stock for a specific week
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {number} weekNumber - Week number (1-52)
   * @param {string} campagne - Campaign (format "25-26")
   * @returns {Promise<Object>} API response with weekly stock data
   */
  async getWeeklyStock(supplierId, siteId, weekNumber, campagne) {
    const params = new URLSearchParams();
    params.append('campagne', campagne || '25-26');
    
    const response = await api.get(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/weeks/${weekNumber}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get stock summary for a supplier site
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {Object} options - Query options
   * @param {string} options.campaign - Optional campaign filter
   * @param {string} options.category - Optional category filter
   * @returns {Promise<Object>} API response with stock summary
   */
  async getStockSummary(supplierId, siteId, options = {}) {
    const params = new URLSearchParams();
    if (options.campaign) params.append('campaign', options.campaign);
    if (options.category) params.append('category', options.category);
    
    const queryString = params.toString();
    const url = `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Export stock data to various formats
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {Object} options - Export options
   * @param {string} options.format - Export format ('xlsx', 'csv', 'pdf')
   * @param {string} options.campaign - Optional campaign filter
   * @param {string} options.category - Optional category filter
   * @returns {Promise<Blob>} File blob for download
   */
  async exportStockData(supplierId, siteId, options = {}) {
    const params = new URLSearchParams();
    params.append('format', options.format || 'xlsx');
    if (options.campaign) params.append('campaign', options.campaign);
    if (options.category) params.append('category', options.category);
    
    const response = await api.get(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/export?${params.toString()}`,
      {
        responseType: 'blob'
      }
    );
    
    return response.data;
  },

  /**
   * Get low stock alerts for a supplier site
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {Object} options - Alert options
   * @param {number} options.threshold - Stock threshold for alerts
   * @returns {Promise<Object>} API response with low stock articles
   */
  async getLowStockAlerts(supplierId, siteId, options = {}) {
    const params = new URLSearchParams();
    if (options.threshold) params.append('threshold', options.threshold.toString());
    
    const queryString = params.toString();
    const url = `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/alerts${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get available campaigns for a supplier site
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @returns {Promise<Object>} API response with available campaigns
   */
  async getAvailableCampaigns(supplierId, siteId) {
    const response = await api.get(
      `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/campaigns`
    );
    return response.data;
  },

  /**
   * Get stock trend analysis
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} articleId - Article ID
   * @param {Object} options - Analysis options
   * @param {string} options.startDate - Start date for analysis
   * @param {string} options.endDate - End date for analysis
   * @param {string} options.groupBy - Group by period ('week', 'month', 'quarter')
   * @returns {Promise<Object>} API response with trend data
   */
  async getStockTrendAnalysis(supplierId, siteId, articleId, options = {}) {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.groupBy) params.append('groupBy', options.groupBy);
    
    const queryString = params.toString();
    const url = `/stocks-fournisseurs/fournisseurs/${supplierId}/sites/${siteId}/articles/${articleId}/trends${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get articles for supplier with their current stock data (combined and paginated)
   * @param {string} supplierId - Supplier ID
   * @param {string} siteId - Site ID
   * @param {string} weekNumber - Week number
   * @param {string} campagne - Campaign (format "25-26")
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term for article filtering
   * @param {string} options.sortBy - Sort field (default: 'codeArticle')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
   * @returns {Promise<Object>} Paginated articles with stock data
   */
  async getArticlesWithStockData(supplierId, siteId, weekNumber, campagne, options = {}) {
    const params = new URLSearchParams();
    params.append('siteId', siteId);
    params.append('weekNumber', weekNumber);
    params.append('campagne', campagne);
    
    // Pagination parameters
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const response = await api.get(`/stocks-fournisseurs/fournisseurs/${supplierId}/articles-with-stock?${params.toString()}`);
    return response.data;
  }
};

export default stockFournisseurAPI;
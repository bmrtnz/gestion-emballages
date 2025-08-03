/**
 * @fileoverview API client for articles operations
 * @module api/articles
 */

import api from './axios';

/**
 * API client for articles management
 * Handles all HTTP requests related to articles
 */
const articlesAPI = {
  /**
   * Get all articles with optional filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} API response
   */
  async getArticles(params = {}) {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  /**
   * Get all active articles without pagination (for forms/selects)
   * @returns {Promise<Object>} API response with all active articles
   */
  async getAllActiveArticles() {
    const response = await api.get('/articles/all-active');
    return response.data;
  },

  /**
   * Get articles by supplier
   * @param {string} supplierId - Supplier ID
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise<Object>} API response with supplier's articles
   */
  async getArticlesBySupplier(supplierId, params = {}) {
    const response = await api.get(`/articles/by-supplier/${supplierId}`, { params });
    return response.data;
  },

  /**
   * Get a specific article by ID
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} API response
   */
  async getArticleById(articleId) {
    const response = await api.get(`/articles/${articleId}`);
    return response.data;
  },

  /**
   * Create a new article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} API response
   */
  async createArticle(articleData) {
    const response = await api.post('/articles', articleData);
    return response.data;
  },

  /**
   * Update an existing article
   * @param {string} articleId - Article ID
   * @param {Object} updateData - Updated article data
   * @returns {Promise<Object>} API response
   */
  async updateArticle(articleId, updateData) {
    const response = await api.put(`/articles/${articleId}`, updateData);
    return response.data;
  },

  /**
   * Delete an article
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} API response
   */
  async deleteArticle(articleId) {
    const response = await api.delete(`/articles/${articleId}`);
    return response.data;
  },

  /**
   * Get article categories
   * @returns {Promise<Object>} API response with available categories
   */
  async getCategories() {
    const response = await api.get('/articles/categories');
    return response.data;
  }
};

export default articlesAPI;
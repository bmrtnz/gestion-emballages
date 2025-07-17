/**
 * @fileoverview Middleware de pagination pour les API
 * @module middleware/paginationMiddleware
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

/**
 * Middleware pour gérer la pagination des requêtes
 * @function paginationMiddleware
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {void}
 * 
 * @example
 * // GET /api/articles?page=2&limit=20&search=barquette&category=Emballage
 * // Ajoute req.pagination: { page: 2, limit: 20, skip: 20, search: 'barquette', filters: { category: 'Emballage' } }
 */
const paginationMiddleware = (req, res, next) => {
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items par page
    const skip = (page - 1) * limit;
    
    // Paramètres de recherche et filtrage
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Filtres dynamiques (tous les autres paramètres de query)
    const filters = {};
    const excludedParams = ['page', 'limit', 'search', 'sortBy', 'sortOrder'];
    
    Object.keys(req.query).forEach(key => {
        if (!excludedParams.includes(key) && req.query[key]) {
            filters[key] = req.query[key];
        }
    });
    
    // Ajouter les paramètres de pagination à l'objet request
    req.pagination = {
        page,
        limit,
        skip,
        search,
        sortBy,
        sortOrder,
        filters
    };
    
    // Fonction utilitaire pour construire la réponse paginée
    req.pagination.buildResponse = (data, totalCount, extraData = {}) => {
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            },
            filters: {
                search,
                sortBy,
                sortOrder: sortOrder === 1 ? 'asc' : 'desc',
                ...filters,
                ...extraData
            }
        };
    };
    
    next();
};

module.exports = paginationMiddleware;
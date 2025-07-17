/**
 * @fileoverview Utility functions for URL handling
 * @module utils/urlHelper
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

const config = require('../config/env');

/**
 * Transform MinIO URL from internal Docker hostname to external accessible host
 * @param {string} url - The MinIO URL to transform
 * @returns {string} - The transformed URL accessible from frontend
 */
const transformMinioUrl = (url) => {
    if (!url) return url;
    
    // Replace internal Docker hostname with external host for frontend access
    const internalPattern = new RegExp(`http://(minio|${config.minio.endPoint}):${config.minio.port}`, 'g');
    const externalUrl = `http://${config.minio.externalHost}:${config.minio.port}`;
    
    return url.replace(internalPattern, externalUrl);
};

/**
 * Ensure URL uses the correct external host for frontend access
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL
 */
const normalizeImageUrl = (url) => {
    if (!url) return url;
    
    // If URL contains the internal minio hostname, replace it
    if (url.includes('://minio:') || url.includes(`://${config.minio.endPoint}:`)) {
        return transformMinioUrl(url);
    }
    
    return url;
};

module.exports = {
    transformMinioUrl,
    normalizeImageUrl
};
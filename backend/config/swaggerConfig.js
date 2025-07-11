// backend/config/swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Gestion des Emballages',
    version: '1.0.0',
    description: 'Documentation de l\'API REST pour l\'application de gestion des commandes d\'emballages.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Serveur de développement local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
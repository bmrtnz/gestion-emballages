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
    schemas: {
      // --- Schémas de base ---
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'ID de l\'utilisateur' },
          email: { type: 'string' },
          nomComplet: { type: 'string' },
          role: { type: 'string', enum: ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'] },
          entiteId: { type: 'string', description: 'ID de la station ou du fournisseur associé' },
        }
      },
      Article: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          codeArticle: { type: 'string' },
          designation: { type: 'string' },
          categorie: { type: 'string' },
          fournisseurs: {
            type: 'array',
            items: { $ref: '#/components/schemas/FournisseurInfo' }
          }
        }
      },
      Fournisseur: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nom: { type: 'string' },
          siret: { type: 'string' },
          sites: {
            type: 'array',
            items: { $ref: '#/components/schemas/Site' }
          }
        }
      },
      Station: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nom: { type: 'string' },
          identifiantInterne: { type: 'string' },
          adresse: {
            type: 'object',
            properties: {
              rue: { type: 'string' },
              codePostal: { type: 'string' },
              ville: { type: 'string' },
              pays: { type: 'string' },
            }
          }
        }
      },
      // --- Schémas imbriqués et spécifiques ---
      FournisseurInfo: {
        type: 'object',
        properties: {
          fournisseurId: { type: 'string', description: 'ID du fournisseur' },
          referenceFournisseur: { type: 'string' },
          prixUnitaire: { type: 'number' },
          uniteConditionnement: { type: 'string' },
          quantiteParConditionnement: { type: 'number' },
        }
      },
      Site: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nomSite: { type: 'string' },
          estPrincipal: { type: 'boolean' },
        }
      },
      ListeAchatItem: {
        type: 'object',
        properties: {
          articleId: { type: 'string' },
          fournisseurId: { type: 'string' },
          quantite: { type: 'number' },
          dateSouhaiteeLivraison: { type: 'string', format: 'date' },
          remarques: { type: 'string' },
        }
      },
      CommandeGlobale: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          referenceGlobale: { type: 'string' },
          stationId: { type: 'string' },
          commandesFournisseurs: { type: 'array', items: { type: 'string' } },
          montantTotalHT: { type: 'number' },
          statutGeneral: { type: 'string' },
        }
      },
      Commande: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          numeroCommande: { type: 'string' },
          fournisseurId: { type: 'string' },
          stationId: { type: 'string' },
          montantTotalHT: { type: 'number' },
          statut: { type: 'string' },
        }
      },
      DemandeTransfert: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          referenceTransfert: { type: 'string' },
          stationDestinationId: { type: 'string' },
          stationSourceId: { type: 'string' },
          statut: { type: 'string' },
        }
      },
      Prevision: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nom: { type: 'string' },
          campagne: { type: 'string' },
          fournisseurId: { type: 'string' },
          articleId: { type: 'string' },
        }
      },
      StockSubmission: {
        type: 'object',
        properties: {
          dateInventaire: { type: 'string', format: 'date' },
          siteId: { type: 'string', description: 'Requis pour les fournisseurs' },
          stocks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                articleId: { type: 'string' },
                quantite: { type: 'number' },
              }
            }
          }
        }
      }
    }
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

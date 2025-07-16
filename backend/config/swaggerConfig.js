// backend/config/swaggerConfig.js
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API Gestion des Emballages",
        version: "1.0.0",
        description: "Documentation de l'API REST pour l'application de gestion des commandes d'emballages.",
    },
    servers: [
        {
            url: "http://localhost:5000/api",
            description: "Serveur de développement local",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            // --- Schémas de base ---
            User: {
                type: "object",
                properties: {
                    _id: { type: "string", description: "ID de l'utilisateur" },
                    email: { type: "string", format: "email" },
                    nomComplet: { type: "string" },
                    telephone: { type: "string" },
                    role: { type: "string", enum: ["Manager", "Gestionnaire", "Station", "Fournisseur"] },
                    entiteId: { type: "string", description: "ID de la station ou du fournisseur associé" },
                    isActive: { type: "boolean", default: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["email", "nomComplet", "role"],
            },
            Article: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    codeArticle: { type: "string" },
                    designation: { type: "string" },
                    categorie: { type: "string" },
                    isActive: { type: "boolean", default: true },
                    fournisseurs: {
                        type: "array",
                        items: { $ref: "#/components/schemas/FournisseurInfo" },
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["codeArticle", "designation"],
            },
            Fournisseur: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    nom: { type: "string" },
                    siret: { type: "string" },
                    sites: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Site" },
                    },
                    documents: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Document" },
                    },
                    isActive: { type: "boolean", default: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["nom"],
            },
            Station: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    nom: { type: "string" },
                    identifiantInterne: { type: "string" },
                    adresse: {
                        type: "object",
                        properties: {
                            rue: { type: "string" },
                            codePostal: { type: "string" },
                            ville: { type: "string" },
                            pays: { type: "string" },
                        },
                    },
                    contactPrincipal: {
                        type: "object",
                        properties: {
                            nom: { type: "string" },
                            email: { type: "string", format: "email" },
                            telephone: { type: "string" },
                        },
                    },
                    isActive: { type: "boolean", default: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["nom", "identifiantInterne"],
            },
            // --- Schémas imbriqués et spécifiques ---
            FournisseurInfo: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    fournisseurId: { type: "string", description: "ID du fournisseur" },
                    referenceFournisseur: { type: "string" },
                    prixUnitaire: { type: "number" },
                    uniteConditionnement: { type: "string" },
                    quantiteParConditionnement: { type: "number" },
                    documents: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Document" },
                    },
                },
                required: ["fournisseurId", "prixUnitaire"],
            },
            Site: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    nomSite: { type: "string" },
                    estPrincipal: { type: "boolean", default: false },
                    adresse: {
                        type: "object",
                        properties: {
                            rue: { type: "string" },
                            codePostal: { type: "string" },
                            ville: { type: "string" },
                            pays: { type: "string" },
                        },
                    },
                    contact: {
                        type: "object",
                        properties: {
                            nom: { type: "string" },
                            email: { type: "string", format: "email" },
                            telephone: { type: "string" },
                        },
                    },
                },
                required: ["nomSite"],
            },
            Document: {
                type: "object",
                properties: {
                    nomDocument: { type: "string" },
                    typeDocument: { type: "string" },
                    urlStockage: { type: "string", description: "Clé MinIO" },
                    dateExpiration: { type: "string", format: "date-time" },
                },
                required: ["nomDocument", "urlStockage"],
            },
            ListeAchat: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    stationId: { type: "string" },
                    statut: { type: "string", enum: ["Brouillon", "Traitée"], default: "Brouillon" },
                    articles: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ListeAchatItem" },
                    },
                    commandeGlobaleId: { type: "string" },
                    creeParId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["stationId", "creeParId"],
            },
            ListeAchatItem: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    articleId: { type: "string" },
                    fournisseurId: { type: "string" },
                    quantite: { type: "number", minimum: 1 },
                    dateSouhaiteeLivraison: { type: "string", format: "date-time" },
                    remarques: { type: "string" },
                },
                required: ["articleId", "fournisseurId", "quantite", "dateSouhaiteeLivraison"],
            },
            CommandeGlobale: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    referenceGlobale: { type: "string" },
                    stationId: { type: "string" },
                    listeAchatId: { type: "string" },
                    commandesFournisseurs: { type: "array", items: { type: "string" } },
                    montantTotalHT: { type: "number" },
                    statutGeneral: { type: "string", enum: ["Enregistrée", "En cours", "Terminée", "Annulée"] },
                    creeParId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["referenceGlobale", "stationId", "creeParId"],
            },
            Commande: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    numeroCommande: { type: "string" },
                    commandeGlobaleId: { type: "string" },
                    fournisseurId: { type: "string" },
                    stationId: { type: "string" },
                    articles: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ArticleCommande" },
                    },
                    montantTotalHT: { type: "number" },
                    statut: {
                        type: "string",
                        enum: ["Enregistrée", "Confirmée", "Expédiée", "Réceptionnée", "Terminée"],
                    },
                    historiqueStatuts: {
                        type: "array",
                        items: { $ref: "#/components/schemas/HistoriqueStatut" },
                    },
                    informationsExpedition: { $ref: "#/components/schemas/InformationsExpedition" },
                    informationsReception: { $ref: "#/components/schemas/InformationsReception" },
                    nonConformitesReception: {
                        type: "array",
                        items: { $ref: "#/components/schemas/NonConformite" },
                    },
                    nonConformitesPosterieures: {
                        type: "array",
                        items: { $ref: "#/components/schemas/NonConformite" },
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["numeroCommande", "fournisseurId", "stationId"],
            },
            ArticleCommande: {
                type: "object",
                properties: {
                    articleId: { type: "string" },
                    referenceFournisseur: { type: "string" },
                    quantiteCommandee: { type: "number" },
                    quantiteRecue: { type: "number", default: 0 },
                    dateSouhaiteeLivraison: { type: "string", format: "date-time" },
                    dateLivraisonConfirmee: { type: "string", format: "date-time" },
                    prixUnitaire: { type: "number" },
                    uniteConditionnement: { type: "string" },
                    quantiteParConditionnement: { type: "number" },
                },
                required: ["articleId", "quantiteCommandee", "prixUnitaire"],
            },
            HistoriqueStatut: {
                type: "object",
                properties: {
                    statut: { type: "string" },
                    date: { type: "string", format: "date-time" },
                    parUtilisateurId: { type: "string" },
                },
            },
            NonConformite: {
                type: "object",
                properties: {
                    referenceNC: { type: "string" },
                    articleId: { type: "string" },
                    type: { type: "string" },
                    description: { type: "string" },
                    photosUrl: { type: "array", items: { type: "string" } },
                },
                required: ["referenceNC"],
            },
            InformationsExpedition: {
                type: "object",
                properties: {
                    dateExpedition: { type: "string", format: "date-time" },
                    transporteur: { type: "string" },
                    numeroSuivi: { type: "string" },
                    bonLivraisonUrl: { type: "string" },
                },
            },
            InformationsReception: {
                type: "object",
                properties: {
                    dateReception: { type: "string", format: "date-time" },
                    receptionnePar: { type: "string" },
                    bonLivraisonEmargeUrl: { type: "string" },
                    commentaires: { type: "string" },
                },
            },
            DemandeTransfert: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    referenceTransfert: { type: "string" },
                    stationDestinationId: { type: "string" },
                    stationSourceId: { type: "string" },
                    articles: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                articleId: { type: "string" },
                                quantiteDemandee: { type: "number" },
                                quantiteAccordee: { type: "number" },
                            },
                        },
                    },
                    statut: { type: "string", enum: ["Enregistrée", "Acceptée", "Refusée", "En transit", "Livrée"] },
                    creeParId: { type: "string" },
                    historiqueStatuts: {
                        type: "array",
                        items: { $ref: "#/components/schemas/HistoriqueStatut" },
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["referenceTransfert", "stationDestinationId", "stationSourceId", "creeParId"],
            },
            Prevision: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    nom: { type: "string" },
                    campagne: { type: "string", description: "Format AA-AA (ex: 25-26)" },
                    fournisseurId: { type: "string" },
                    articleId: { type: "string" },
                    previsionsHebdomadaires: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                annee: { type: "number" },
                                numeroSemaine: { type: "number", minimum: 1, maximum: 52 },
                                quantitePrevue: { type: "number", default: 0 },
                                dateMiseAJour: { type: "string", format: "date-time" },
                            },
                        },
                    },
                    creeParId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["nom", "campagne", "fournisseurId", "articleId", "creeParId"],
            },
            StockStation: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    stationId: { type: "string" },
                    articleId: { type: "string" },
                    quantite: { type: "number" },
                    dateInventaire: { type: "string", format: "date-time" },
                    creeParId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["stationId", "articleId", "quantite", "dateInventaire", "creeParId"],
            },
            StockFournisseur: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    fournisseurId: { type: "string" },
                    siteId: { type: "string", description: "ID du site dans le document Fournisseur" },
                    articleId: { type: "string" },
                    quantite: { type: "number" },
                    dateInventaire: { type: "string", format: "date-time" },
                    creeParId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["fournisseurId", "siteId", "articleId", "quantite", "dateInventaire", "creeParId"],
            },
            StockSubmission: {
                type: "object",
                properties: {
                    dateInventaire: { type: "string", format: "date-time" },
                    siteId: { type: "string", description: "Requis pour les fournisseurs" },
                    stocks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                articleId: { type: "string" },
                                quantite: { type: "number" },
                            },
                            required: ["articleId", "quantite"],
                        },
                    },
                },
                required: ["dateInventaire", "stocks"],
            },
            UploadResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    fileUrl: { type: "string", description: "URL publique du fichier" },
                    fileKey: { type: "string", description: "Clé du fichier dans MinIO" },
                },
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    error: { type: "string" },
                    statusCode: { type: "number" },
                },
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
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

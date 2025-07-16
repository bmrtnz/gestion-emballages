/**
 * @fileoverview Contrôleur pour la gestion des prévisions de consommation d'articles
 * @module controllers/previsionController
 * @requires models/previsionModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/previsionController.js
const Prevision = require('../models/previsionModel');
const { NotFoundError } = require('../utils/appError');
// Removed asyncHandler for cleaner testing and error handling

/**
 * Créer une nouvelle campagne de prévision pour un article et un fournisseur donnés.
 * Génère automatiquement les entrées hebdomadaires pour une campagne (S27 à S26).
 * @function createPrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.campagne - Nom de la campagne au format "AA-AA" (ex: "25-26")
 * @param {string} req.body.fournisseurId - ID du fournisseur
 * @param {string} req.body.articleId - ID de l'article
 * @param {string} req.body.nom - Nom de la prévision
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user._id - ID de l'utilisateur créateur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision créée avec toutes les semaines générées
 * @since 1.0.0
 * @example
 * // POST /api/previsions
 * // Body: { "campagne": "25-26", "fournisseurId": "64f5a1b2c3d4e5f6a7b8c9d0", "articleId": "64f5a1b2c3d4e5f6a7b8c9d1", "nom": "Prévision Cartons 2025-2026" }
 * // Response: { "_id": "...", "nom": "Prévision Cartons 2025-2026", "campagne": "25-26", "previsionsHebdomadaires": [{ "annee": 2025, "numeroSemaine": 27, "quantitePrevue": 0 }, ...] }
 */
exports.createPrevision = async (req, res, next) => {
    try {
        const { campagne, fournisseurId, articleId, nom } = req.body;
        
        // Calcule l'année de début à partir du format de campagne "AA-AA". Ex: "25-26" -> 2025.
        const anneeDebut = 2000 + parseInt(campagne.split('-')[0]); 

        const previsionsHebdomadaires = [];
        // Génère les entrées pour les semaines de la première année (S27 à S52).
        for (let i = 27; i <= 52; i++) {
            previsionsHebdomadaires.push({ annee: anneeDebut, numeroSemaine: i, quantitePrevue: 0 });
        }
        // Génère les entrées pour les semaines de la deuxième année (S1 à S26).
        for (let i = 1; i <= 26; i++) {
            previsionsHebdomadaires.push({ annee: anneeDebut + 1, numeroSemaine: i, quantitePrevue: 0 });
        }

        // Crée le document de prévision avec les semaines générées.
        const prevision = await Prevision.create({
            nom,
            campagne,
            fournisseurId,
            articleId,
            previsionsHebdomadaires,
            creeParId: req.user._id
        });
        res.status(201).json(prevision);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour les quantités prévues pour une ou plusieurs semaines d'une campagne.
 * @function updatePrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la prévision à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {Array<Object>} req.body.updates - Tableau des mises à jour à appliquer
 * @param {number} req.body.updates[].annee - Année de la semaine à mettre à jour
 * @param {number} req.body.updates[].numeroSemaine - Numéro de la semaine à mettre à jour
 * @param {number} req.body.updates[].quantitePrevue - Nouvelle quantité prévue
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision mise à jour
 * @throws {NotFoundError} Si la prévision n'est pas trouvée
 * @since 1.0.0
 * @example
 * // PUT /api/previsions/64f5a1b2c3d4e5f6a7b8c9d0
 * // Body: { "updates": [{ "annee": 2025, "numeroSemaine": 27, "quantitePrevue": 100 }, { "annee": 2025, "numeroSemaine": 28, "quantitePrevue": 150 }] }
 * // Response: { "_id": "...", "previsionsHebdomadaires": [{ "annee": 2025, "numeroSemaine": 27, "quantitePrevue": 100, "dateMiseAJour": "..." }, ...] }
 */
exports.updatePrevision = async (req, res, next) => {
    try {
        // Le corps de la requête doit contenir un tableau d'objets de mise à jour.
        const { updates } = req.body; // updates: [{ annee, numeroSemaine, quantitePrevue }]
        const prevision = await Prevision.findById(req.params.id);

        if (!prevision) {
            return next(new NotFoundError('Prévision non trouvée'));
        }

        // Applique chaque mise à jour au sous-document correspondant.
        updates.forEach(update => {
            const weekToUpdate = prevision.previsionsHebdomadaires.find(
                w => w.annee === update.annee && w.numeroSemaine === update.numeroSemaine
            );
            if (weekToUpdate) {
                weekToUpdate.quantitePrevue = update.quantitePrevue;
                weekToUpdate.dateMiseAJour = new Date(); // Enregistre la date de la modification.
            }
        });

        const updatedPrevision = await prevision.save();
        res.json(updatedPrevision);
    } catch (error) {
        next(error);
    }
};

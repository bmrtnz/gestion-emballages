// backend/controllers/previsionController.js
const Prevision = require('../models/previsionModel');
const { NotFoundError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @description Créer une nouvelle campagne de prévision pour un article et un fournisseur donnés.
 *              Génère automatiquement les entrées hebdomadaires pour une campagne (S27 à S26).
 * @route POST /api/previsions
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.createPrevision = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Mettre à jour les quantités prévues pour une ou plusieurs semaines d'une campagne.
 * @route PUT /api/previsions/:id
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updatePrevision = asyncHandler(async (req, res, next) => {
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
});

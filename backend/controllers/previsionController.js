// backend/controllers/previsionController.js
const Prevision = require('../models/previsionModel');

// @desc    Créer une nouvelle campagne de prévision
exports.createPrevision = async (req, res) => {
    try {
        const { campagne, fournisseurId, articleId, nom } = req.body;
        
        // Ex: "25-26" -> anneeDebut = 2025
        const anneeDebut = 2000 + parseInt(campagne.split('-')[0]); 

        const previsionsHebdomadaires = [];
        // Générer les semaines pour la première année (de la semaine 27 à la 52)
        for (let i = 27; i <= 52; i++) {
            previsionsHebdomadaires.push({ annee: anneeDebut, numeroSemaine: i });
        }
        // Générer les semaines pour la deuxième année (de la semaine 1 à la 26)
        for (let i = 1; i <= 26; i++) {
            previsionsHebdomadaires.push({ annee: anneeDebut + 1, numeroSemaine: i });
        }

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
        res.status(400).json({ message: "Erreur de création de la prévision", error: error.message });
    }
};

// @desc    Mettre à jour les quantités d'une prévision
exports.updatePrevision = async (req, res) => {
    try {
        const { updates } = req.body; // updates: [{ annee, numeroSemaine, quantitePrevue }]
        const prevision = await Prevision.findById(req.params.id);

        if (!prevision) {
            return res.status(404).json({ message: 'Prévision non trouvée' });
        }

        // Appliquer les mises à jour
        updates.forEach(update => {
            const weekToUpdate = prevision.previsionsHebdomadaires.find(
                w => w.annee === update.annee && w.numeroSemaine === update.numeroSemaine
            );
            if (weekToUpdate) {
                weekToUpdate.quantitePrevue = update.quantitePrevue;
                weekToUpdate.dateMiseAJour = new Date();
            }
        });

        const updatedPrevision = await prevision.save();
        res.json(updatedPrevision);
    } catch (error) {
        res.status(400).json({ message: "Erreur de mise à jour", error: error.message });
    }
};
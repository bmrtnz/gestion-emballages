// backend/controllers/fournisseurController.js
const Fournisseur = require('../models/fournisseurModel');

// @desc    Créer un nouveau fournisseur
exports.createFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.create(req.body);
        res.status(201).json(fournisseur);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du fournisseur', error: error.message });
    }
};

// @desc    Obtenir tous les fournisseurs
exports.getFournisseurs = async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find({ isActive: true });
        res.json(fournisseurs);
    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur' });
    }
};

// @desc    Mettre à jour un fournisseur
exports.updateFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!fournisseur) {
            return res.status(404).json({ message: 'Fournisseur non trouvé' });
        }
        res.json(fournisseur);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
    }
};

// @desc    Désactiver un fournisseur
exports.deleteFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!fournisseur) {
            return res.status(404).json({ message: 'Fournisseur non trouvé' });
        }
        res.json({ message: 'Fournisseur désactivé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur' });
    }
};

// @desc    Ajouter un site à un fournisseur existant
exports.addSiteToFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findById(req.params.id);

        if (!fournisseur) {
            return res.status(404).json({ message: 'Fournisseur non trouvé' });
        }

        const nouveauSite = req.body;

        // Logique pour s'assurer qu'il n'y a qu'un seul site principal
        if (nouveauSite.estPrincipal) {
            fournisseur.sites.forEach(site => {
                site.estPrincipal = false;
            });
        }

        fournisseur.sites.push(nouveauSite);
        
        await fournisseur.save();
        res.status(201).json(fournisseur);

    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de l\'ajout du site', error: error.message });
    }
};

// @desc    Supprimer un site d'un fournisseur
exports.deleteSiteFromFournisseur = async (req, res) => {
    try {
        const { id: fournisseurId, siteId } = req.params;

        const fournisseur = await Fournisseur.findById(fournisseurId);

        if (!fournisseur) {
            return res.status(404).json({ message: 'Fournisseur non trouvé' });
        }

        // Empêcher la suppression du dernier site
        if (fournisseur.sites.length <= 1) {
            return res.status(400).json({ message: 'Impossible de supprimer le dernier site d\'un fournisseur.' });
        }

        // Tirer (pull) le sous-document du tableau des sites
        fournisseur.sites.pull({ _id: siteId });

        await fournisseur.save();
        res.json({ message: 'Site supprimé avec succès' });

    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du site', error: error.message });
    }
};
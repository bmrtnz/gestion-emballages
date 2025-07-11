// backend/controllers/commandeController.js
const Commande = require('../models/commandeModel');

// @desc    Obtenir une commande par son ID
// @route   GET /api/commandes/:id
// @access  Privé
exports.getCommandeById = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id)
            .populate('stationId', 'nom')
            .populate('fournisseurId', 'nom')
            .populate('articles.articleId', 'codeArticle designation');

        if (!commande) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        res.json(commande);
    } catch (error) {
        res.status(500).json({ message: 'Erreur Serveur', error: error.message });
    }
};

// @desc    Mettre à jour le statut d'une commande
// @route   PUT /api/commandes/:id/statut
// @access  Privé (Fournisseur, Station, Gestionnaire)
exports.updateCommandeStatut = async (req, res) => {
    try {
        const { statut, articles, informationsExpedition, informationsReception, nonConformitesReception } = req.body;
        const commande = await Commande.findById(req.params.id);

        if (!commande) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // --- Logique de workflow ---
        switch (statut) {
            case 'Confirmée':
                // Seul le bon fournisseur peut confirmer une commande "Enregistrée"
                if (commande.statut !== 'Enregistrée') {
                    return res.status(400).json({ message: `La commande ne peut être confirmée que si son statut est "Enregistrée".` });
                }
                if (req.user.role !== 'Fournisseur' || !req.user.entiteId || req.user.entiteId.toString() !== commande.fournisseurId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                if (commande.statut !== 'Enregistrée') {
                    return res.status(400).json({ message: `La commande ne peut être confirmée que si son statut est "Enregistrée".` });
                }
                // Mettre à jour les dates de livraison confirmées pour chaque article
                articles.forEach(articleUpdate => {
                    const articleDansCommande = commande.articles.find(a => a._id.toString() === articleUpdate._id);
                    if (articleDansCommande) {
                        articleDansCommande.dateLivraisonConfirmee = articleUpdate.dateLivraisonConfirmee;
                    }
                });
                break;
            
                case 'Expédiée':
                // Seul le bon fournisseur peut expédier une commande "Confirmée"
                if (commande.statut !== 'Confirmée') {
                    return res.status(400).json({ message: `La commande ne peut être expédiée que si son statut est "Confirmée".` });
                }
                if (req.user.role !== 'Fournisseur' || req.user.entiteId.toString() !== commande.fournisseurId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                if (!informationsExpedition || !informationsExpedition.bonLivraisonUrl) {
                     return res.status(400).json({ message: 'Le Bon de Livraison est obligatoire.' });
                }
                // Mettre à jour les informations d'expédition
                commande.informationsExpedition = {
                    dateExpedition: new Date(),
                    transporteur: informationsExpedition.transporteur,
                    numeroSuivi: informationsExpedition.numeroSuivi,
                    bonLivraisonUrl: informationsExpedition.bonLivraisonUrl,
                };
                break;

                case 'Réceptionnée':
                // Seule la bonne station peut réceptionner une commande "Expédiée"
                if (commande.statut !== 'Expédiée') {
                    return res.status(400).json({ message: `La commande ne peut être réceptionnée que si son statut est "Expédiée".` });
                }
                if (req.user.role !== 'Station' || !req.user.entiteId || req.user.entiteId.toString() !== commande.stationId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                if (!informationsReception || !informationsReception.bonLivraisonEmargeUrl) {
                     return res.status(400).json({ message: 'Le Bon de Livraison émargé est obligatoire.' });
                }
                // Mettre à jour les quantités reçues pour chaque article
                articles.forEach(articleUpdate => {
                    const articleDansCommande = commande.articles.find(a => a._id.toString() === articleUpdate._id);
                    if (articleDansCommande) {
                        articleDansCommande.quantiteRecue = articleUpdate.quantiteRecue;
                    }
                });
                // Mettre à jour les informations de réception
                commande.informationsReception = {
                    dateReception: new Date(),
                    bonLivraisonEmargeUrl: informationsReception.bonLivraisonEmargeUrl,
                };
                // Ajouter les éventuelles non-conformités
                if (nonConformitesReception && nonConformitesReception.length > 0) {
                    commande.nonConformitesReception = nonConformitesReception;
                }
                break;

                case 'Clôturée':
                // Seule la station concernée peut clôturer une commande "Réceptionnée"
                if (commande.statut !== 'Réceptionnée') {
                    return res.status(400).json({ message: `La commande ne peut être clôturée que si son statut est "Réceptionnée".` });
                }
                if (req.user.role !== 'Station' || !req.user.entiteId || req.user.entiteId.toString() !== commande.stationId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                // Aucune autre donnée n'est nécessaire pour cette étape
                break;

                case 'Facturée':
                // Seul un Gestionnaire ou Manager peut facturer une commande "Clôturée"
                if (commande.statut !== 'Clôturée') {
                    return res.status(400).json({ message: `La commande ne peut être facturée que si son statut est "Clôturée".` });
                }
                if (req.user.role !== 'Gestionnaire' && req.user.role !== 'Manager') {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                break;

                case 'Archivée':
                // Seul un Gestionnaire ou Manager peut archiver une commande "Facturée"
                if (commande.statut !== 'Facturée') {
                    return res.status(400).json({ message: `La commande ne peut être archivée que si son statut est "Facturée".` });
                }
                if (req.user.role !== 'Gestionnaire' && req.user.role !== 'Manager') {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                break;

            // ... nous ajouterons les autres cas (Expédiée, Réceptionnée, etc.) ici plus tard

            default:
                return res.status(400).json({ message: 'Statut invalide.' });
        }

        // Mettre à jour le statut et l'historique
        commande.statut = statut;
        commande.historiqueStatuts.push({
            statut: statut,
            date: new Date(),
            parUtilisateurId: req.user._id
        });

        const updatedCommande = await commande.save();
        res.json(updatedCommande);

    } catch (error) {
        res.status(500).json({ message: 'Erreur Serveur', error: error.message });
    }
};
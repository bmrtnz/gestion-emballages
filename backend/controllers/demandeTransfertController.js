// backend/controllers/demandeTransfertController.js
const DemandeTransfert = require('../models/demandeTransfertModel');

// @desc    Créer une nouvelle demande de transfert
exports.createDemandeTransfert = async (req, res) => {
    try {
        const { stationSourceId, articles } = req.body;
        const stationDestinationId = req.user.entiteId; // La station qui demande est celle de l'utilisateur connecté

        if (!stationDestinationId) {
            return res.status(400).json({ message: "Utilisateur non associé à une station." });
        }

        const demande = await DemandeTransfert.create({
            referenceTransfert: `TR-${Date.now()}`,
            stationDestinationId,
            stationSourceId,
            articles,
            creeParId: req.user._id,
            historiqueStatuts: [{ statut: 'Enregistrée', date: new Date(), parUtilisateurId: req.user._id }]
        });

        res.status(201).json(demande);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de la demande', error: error.message });
    }
};

// @desc    Mettre à jour le statut d'une demande de transfert
exports.updateDemandeTransfertStatut = async (req, res) => {
    try {
        const { statut, motifRejet, articles, informationsExpedition, informationsReception } = req.body;
        const demande = await DemandeTransfert.findById(req.params.id);

        if (!demande) {
            return res.status(404).json({ message: 'Demande de transfert non trouvée' });
        }

        // Logique de workflow
        switch (statut) {
            case 'Confirmée':
            case 'Rejetée':
                // Seule la station source peut confirmer ou rejeter une demande "Enregistrée"
                if (demande.statut !== 'Enregistrée') {
                    return res.status(400).json({ message: `La demande ne peut être traitée que si son statut est "Enregistrée".` });
                }
                if (req.user.role !== 'Station' || !req.user.entiteId || req.user.entiteId.toString() !== demande.stationSourceId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }

                if (statut === 'Rejetée') {
                    if (!motifRejet) return res.status(400).json({ message: 'Un motif de rejet est obligatoire.' });
                    demande.motifRejet = motifRejet;
                }

                if (statut === 'Confirmée') {
                    // Mettre à jour les quantités confirmées
                    articles.forEach(articleUpdate => {
                        const articleDansDemande = demande.articles.find(a => a._id.toString() === articleUpdate._id);
                        if (articleDansDemande) {
                            articleDansDemande.quantiteConfirmee = articleUpdate.quantiteConfirmee;
                        }
                    });
                }
                break;

                case 'Traitée logistique':
                // Seul un Gestionnaire/Manager peut traiter une demande "Confirmée"
                if (demande.statut !== 'Confirmée') {
                    return res.status(400).json({ message: `La demande ne peut être traitée que si son statut est "Confirmée".` });
                }
                if (req.user.role !== 'Gestionnaire' && req.user.role !== 'Manager') {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                break;

                case 'Expédiée':
                // Seule la station source peut expédier une demande "Traitée logistique"
                if (demande.statut !== 'Traitée logistique') {
                    return res.status(400).json({ message: `La demande ne peut être expédiée que si son statut est "Traitée logistique".` });
                }
                if (req.user.role !== 'Station' || !req.user.entiteId || req.user.entiteId.toString() !== demande.stationSourceId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                if (!informationsExpedition || !informationsExpedition.bonLivraisonUrl) {
                    return res.status(400).json({ message: 'Le Bon de Livraison est obligatoire.' });
                }
                demande.informationsExpedition = {
                    dateExpedition: new Date(),
                    bonLivraisonUrl: informationsExpedition.bonLivraisonUrl
                };
                break;

                case 'Réceptionnée':
                // Seule la station destination peut réceptionner une demande "Expédiée"
                if (demande.statut !== 'Expédiée') {
                    return res.status(400).json({ message: `La demande ne peut être réceptionnée que si son statut est "Expédiée".` });
                }
                if (req.user.role !== 'Station' || !req.user.entiteId || req.user.entiteId.toString() !== demande.stationDestinationId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                if (!informationsReception || !informationsReception.bonLivraisonEmargeUrl) {
                    return res.status(400).json({ message: 'Le Bon de Livraison émargé est obligatoire.' });
                }
                // Mettre à jour les quantités reçues
                articles.forEach(articleUpdate => {
                    const articleDansDemande = demande.articles.find(a => a._id.toString() === articleUpdate._id);
                    if (articleDansDemande) {
                        articleDansDemande.quantiteRecue = articleUpdate.quantiteRecue;
                    }
                });
                demande.informationsReception = {
                    dateReception: new Date(),
                    bonLivraisonEmargeUrl: informationsReception.bonLivraisonEmargeUrl,
                };
                break;

                case 'Clôturée':
                // Seule la station destination peut clôturer une demande "Réceptionnée"
                if (demande.statut !== 'Réceptionnée') {
                    return res.status(400).json({ message: `La demande ne peut être clôturée que si son statut est "Réceptionnée".` });
                }
                if (req.user.role !== 'Station' || !req.user.entiteId || req.user.entiteId.toString() !== demande.stationDestinationId.toString()) {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                break;

                case 'Traitée comptabilité':
                // Seul un Gestionnaire/Manager peut traiter une demande "Clôturée"
                if (demande.statut !== 'Clôturée') {
                    return res.status(400).json({ message: `La demande ne peut être traitée comptablement que si son statut est "Clôturée".` });
                }
                if (req.user.role !== 'Gestionnaire' && req.user.role !== 'Manager') {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                break;

                case 'Archivée':
                // Seul un Gestionnaire/Manager peut archiver une demande "Traitée comptabilité"
                if (demande.statut !== 'Traitée comptabilité') {
                    return res.status(400).json({ message: `La demande ne peut être archivée que si son statut est "Traitée comptabilité".` });
                }
                if (req.user.role !== 'Gestionnaire' && req.user.role !== 'Manager') {
                    return res.status(403).json({ message: 'Action non autorisée.' });
                }
                break;
            
            // ... nous ajouterons les autres cas ici plus tard

            default:
                return res.status(400).json({ message: 'Statut invalide.' });
        }

        demande.statut = statut;
        demande.historiqueStatuts.push({ statut, date: new Date(), parUtilisateurId: req.user._id });

        const updatedDemande = await demande.save();
        res.json(updatedDemande);

    } catch (error) {
        res.status(500).json({ message: 'Erreur Serveur', error: error.message });
    }
};
// backend/controllers/listeAchatController.js
const ListeAchat = require('../models/listeAchatModel');
const Commande = require('../models/commandeModel');
const CommandeGlobale = require('../models/commandeGlobaleModel');
const Article = require('../models/articleModel');

// @desc    Obtenir ou créer la liste d'achat brouillon de la station
exports.getOrCreateListeAchat = async (req, res) => {
    try {
        const stationId = req.user.entiteId;
        if (!stationId) {
            return res.status(400).json({ message: "Cet utilisateur n'est associé à aucune station." });
        }
        let listeAchat = await ListeAchat.findOne({ stationId, statut: 'Brouillon' });

        if (!listeAchat) {
            listeAchat = await ListeAchat.create({ stationId, creeParId: req.user._id, articles: [] });
        }
        res.json(listeAchat);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Ajouter/mettre à jour un article dans la liste
exports.updateItemInListeAchat = async (req, res) => {
    try {
        const { articleId, fournisseurId, quantite, dateSouhaiteeLivraison } = req.body;
        const stationId = req.user.entiteId;
        const listeAchat = await ListeAchat.findOne({ stationId, statut: 'Brouillon' });
        
        // Logique pour ajouter/mettre à jour l'article dans le tableau...
        // ... (cette partie peut être détaillée si besoin)
        const itemIndex = listeAchat.articles.findIndex(p => p.articleId.toString() === articleId && p.fournisseurId.toString() === fournisseurId);

        if (itemIndex > -1) {
            // Mettre à jour la quantité
            listeAchat.articles[itemIndex].quantite = quantite;
        } else {
            // Ajouter le nouvel article
            listeAchat.articles.push({ articleId, fournisseurId, quantite, dateSouhaiteeLivraison });
        }

        await listeAchat.save();
        res.json(listeAchat);

    } catch (error) {
        res.status(400).json({ message: 'Erreur de mise à jour', error: error.message });
    }
};

// @desc    Valider la liste et créer les commandes
exports.validateListeAchat = async (req, res) => {
    const stationId = req.user.entiteId;
    const listeAchat = await ListeAchat.findOne({ stationId, statut: 'Brouillon' }).populate('articles.articleId');

    if (!listeAchat || listeAchat.articles.length === 0) {
        return res.status(400).json({ message: 'La liste d\'achat est vide' });
    }

    try {
        // 1. Regrouper les articles par fournisseur
        const commandesParFournisseur = new Map();
        for (const item of listeAchat.articles) {
            const fournisseurId = item.fournisseurId.toString();
            if (!commandesParFournisseur.has(fournisseurId)) {
                commandesParFournisseur.set(fournisseurId, []);
            }
            commandesParFournisseur.get(fournisseurId).push(item);
        }

        let montantTotalGlobal = 0;
        const commandesCreesIds = [];

        // 2. Créer une commande par fournisseur
        for (const [fournisseurId, items] of commandesParFournisseur.entries()) {
            let montantTotalCommande = 0;
            const articlesDeCommande = [];

            for (const item of items) {
                // 3. "Figer" le prix et les infos de l'article
                const articleData = item.articleId.fournisseurs.find(f => f.fournisseurId.toString() === fournisseurId);
                if (!articleData) continue; // Sécurité

                const prix = articleData.prixUnitaire; // On pourrait chercher un prix contrat ici
                montantTotalCommande += prix * item.quantite;
                
                articlesDeCommande.push({
                    articleId: item.articleId._id,
                    quantiteCommandee: item.quantite,
                    dateSouhaiteeLivraison: item.dateSouhaiteeLivraison,
                    prixUnitaire: prix,
                    uniteConditionnement: articleData.uniteConditionnement,
                    quantiteParConditionnement: articleData.quantiteParConditionnement
                });
            }
            
            // 4. Créer le document Commande
            const nouvelleCommande = await Commande.create({
                numeroCommande: `CMD-${Date.now()}-${fournisseurId.slice(-4)}`, // Logique de N° à affiner
                fournisseurId: fournisseurId,
                stationId: stationId,
                articles: articlesDeCommande,
                montantTotalHT: montantTotalCommande
            });
            commandesCreesIds.push(nouvelleCommande._id);
            montantTotalGlobal += montantTotalCommande;
        }

        // 5. Créer la Commande Globale
        const commandeGlobale = await CommandeGlobale.create({
            referenceGlobale: `CG-${Date.now()}`,
            stationId: stationId,
            listeAchatId: listeAchat._id,
            commandesFournisseurs: commandesCreesIds,
            montantTotalHT: montantTotalGlobal,
            creeParId: req.user._id
        });
        
        // 6. Lier les commandes enfants à la commande globale
        await Commande.updateMany({ _id: { $in: commandesCreesIds } }, { commandeGlobaleId: commandeGlobale._id });

        // 7. Mettre à jour la liste d'achat
        listeAchat.statut = 'Traitée';
        listeAchat.commandeGlobaleId = commandeGlobale._id;
        await listeAchat.save();

        res.status(201).json({ message: 'Commandes créées avec succès', commandeGlobaleId: commandeGlobale._id });

    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
    }
};
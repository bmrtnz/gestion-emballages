/**
 * @fileoverview Contrôleur pour la gestion des fournisseurs et de leurs sites
 * @module controllers/fournisseurController
 * @requires models/fournisseurModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/fournisseurController.js
const Fournisseur = require("../models/fournisseurModel");
const { NotFoundError, BadRequestError } = require('../utils/appError');
// Removed asyncHandler for cleaner testing and error handling

/**
 * Créer un nouveau fournisseur.
 * @function createFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.nom - Nom du fournisseur
 * @param {string} [req.body.email] - Email du fournisseur
 * @param {string} [req.body.telephone] - Téléphone du fournisseur
 * @param {Array<Object>} [req.body.sites] - Liste des sites du fournisseur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie le fournisseur créé avec le statut 201
 * @since 1.0.0
 * @example
 * // POST /api/fournisseurs
 * // Body: { "nom": "Fournisseur ABC", "email": "contact@abc.com", "telephone": "0123456789" }
 * // Response: { "_id": "...", "nom": "Fournisseur ABC", "email": "contact@abc.com", "isActive": true, "sites": [] }
 */
exports.createFournisseur = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.create(req.body);
    res.status(201).json(fournisseur);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir tous les fournisseurs actifs, triés par nom.
 * @function getFournisseurs
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste des fournisseurs actifs triés par nom
 * @since 1.0.0
 * @example
 * // GET /api/fournisseurs
 * // Response: [{ "_id": "...", "nom": "Fournisseur ABC", "email": "contact@abc.com", "isActive": true, "sites": [...] }]
 */
exports.getFournisseurs = async (req, res, next) => {
  try {
    const fournisseurs = await Fournisseur.find({}).sort({ nom: 1 });
    res.json(fournisseurs);
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un fournisseur par son ID.
 * @function updateFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID du fournisseur à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.nom] - Nouveau nom du fournisseur
 * @param {string} [req.body.email] - Nouvel email du fournisseur
 * @param {string} [req.body.telephone] - Nouveau téléphone du fournisseur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie le fournisseur mis à jour
 * @throws {NotFoundError} Si le fournisseur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PUT /api/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d0
 * // Body: { "nom": "Nouveau Nom", "email": "nouveau@email.com" }
 * // Response: { "_id": "...", "nom": "Nouveau Nom", "email": "nouveau@email.com", ... }
 */
exports.updateFournisseur = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Retourne le document mis à jour.
        runValidators: true, // Exécute les validateurs du schéma Mongoose.
      }
    );
    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }
    res.json(fournisseur);
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver un fournisseur (suppression logique ou "soft delete").
 * @function deactivateFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID du fournisseur à désactiver
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation de désactivation
 * @throws {NotFoundError} Si le fournisseur n'est pas trouvé
 * @throws {BadRequestError} Si le fournisseur a des liens qui empêchent la désactivation
 * @since 1.0.0
 * @example
 * // DELETE /api/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "message": "Fournisseur désactivé avec succès" }
 */
exports.deactivateFournisseur = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);

    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }

    // Check for linked commandes that are not archived
    const Commande = require('../models/commandeModel');
    const linkedCommandes = await Commande.find({ 
      fournisseurId: req.params.id,
      statut: { $ne: 'Archivée' }
    });

    if (linkedCommandes.length > 0) {
      return next(new BadRequestError("Impossible de désactiver ce fournisseur car il a des commandes non archivées"));
    }

    // Check for linked transferts that are not archived (via articles)
    const DemandeTransfert = require('../models/demandeTransfertModel');
    const Article = require('../models/articleModel');
    
    // Find articles linked to this fournisseur
    const linkedArticles = await Article.find({ 
      'fournisseurs.fournisseurId': req.params.id 
    });

    if (linkedArticles.length > 0) {
      const articleIds = linkedArticles.map(article => article._id);
      const linkedTransferts = await DemandeTransfert.find({
        'articles.articleId': { $in: articleIds },
        statut: { $ne: 'Archivée' }
      });

      if (linkedTransferts.length > 0) {
        return next(new BadRequestError("Impossible de désactiver ce fournisseur car il a des transferts non archivés"));
      }
    }

    // Business rule: When supplier is deactivated, all its sites are deactivated
    fournisseur.isActive = false;
    fournisseur.sites.forEach(site => {
      site.isActive = false;
    });
    
    await fournisseur.save();
    res.json({ message: "Fournisseur et tous ses sites désactivés avec succès" });
  } catch (error) {
    next(error);
  }
};

/**
 * Réactiver un fournisseur.
 * @function reactivateFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID du fournisseur à réactiver
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation de réactivation
 * @throws {NotFoundError} Si le fournisseur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PATCH /api/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d0/reactivate
 * // Response: { "message": "Fournisseur réactivé avec succès" }
 */
exports.reactivateFournisseur = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    
    if (!fournisseur) {
      return next(new NotFoundError('Fournisseur non trouvé'));
    }
    
    // Business rule: When supplier is reactivated, all its sites are reactivated
    fournisseur.isActive = true;
    fournisseur.sites.forEach(site => {
      site.isActive = true;
    });
    
    await fournisseur.save();
    
    res.json({ message: 'Fournisseur et tous ses sites réactivés avec succès' });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un site à un fournisseur existant.
 * @function addSiteToFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID du fournisseur
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.nom - Nom du site
 * @param {string} req.body.adresse - Adresse du site
 * @param {string} [req.body.ville] - Ville du site
 * @param {string} [req.body.codePostal] - Code postal du site
 * @param {string} [req.body.telephone] - Téléphone du site
 * @param {boolean} [req.body.estPrincipal] - Indique si le site est principal
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie le fournisseur avec le nouveau site ajouté
 * @throws {NotFoundError} Si le fournisseur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // POST /api/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d0/sites
 * // Body: { "nom": "Site Principal", "adresse": "123 Rue Example", "ville": "Paris", "estPrincipal": true }
 * // Response: { "_id": "...", "nom": "Fournisseur ABC", "sites": [{ "nom": "Site Principal", "adresse": "123 Rue Example", ... }] }
 */
exports.addSiteToFournisseur = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);

    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }

    const nouveauSite = req.body;

    // S'assure qu'un seul site peut être marqué comme principal.
    if (nouveauSite.estPrincipal) {
      fournisseur.sites.forEach((site) => {
        site.estPrincipal = false;
      });
    }

    // Business rule: If supplier is inactive, new sites should be inactive
    if (!fournisseur.isActive) {
      nouveauSite.isActive = false;
    }

    fournisseur.sites.push(nouveauSite);
    await fournisseur.save();
    res.status(201).json(fournisseur);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un site d'un fournisseur.
 * @function deleteSiteFromFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID du fournisseur
 * @param {string} req.params.siteId - ID du site à supprimer
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation de suppression
 * @throws {NotFoundError} Si le fournisseur n'est pas trouvé
 * @throws {BadRequestError} Si c'est le dernier site du fournisseur
 * @since 1.0.0
 * @example
 * // DELETE /api/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d0/sites/64f5a1b2c3d4e5f6a7b8c9d1
 * // Response: { "message": "Site supprimé avec succès" }
 */
exports.deleteSiteFromFournisseur = async (req, res, next) => {
  try {
    const { id: fournisseurId, siteId } = req.params;
    const fournisseur = await Fournisseur.findById(fournisseurId);

    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }

    // Empêche la suppression du dernier site d'un fournisseur.
    if (fournisseur.sites.length <= 1) {
      return next(new BadRequestError("Impossible de supprimer le dernier site d'un fournisseur."));
    }

    // Retire le sous-document du tableau des sites.
    fournisseur.sites.pull({ _id: siteId });
    await fournisseur.save();
    res.json({ message: "Site supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un site spécifique d'un fournisseur.
 * @function updateSiteInFournisseur
 * @memberof module:controllers/fournisseurController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID du fournisseur
 * @param {string} req.params.siteId - ID du site à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.nom] - Nouveau nom du site
 * @param {string} [req.body.adresse] - Nouvelle adresse du site
 * @param {string} [req.body.ville] - Nouvelle ville du site
 * @param {string} [req.body.codePostal] - Nouveau code postal du site
 * @param {string} [req.body.telephone] - Nouveau téléphone du site
 * @param {boolean} [req.body.estPrincipal] - Indique si le site devient principal
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie le fournisseur avec le site mis à jour
 * @throws {NotFoundError} Si le fournisseur ou le site n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PUT /api/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d0/sites/64f5a1b2c3d4e5f6a7b8c9d1
 * // Body: { "nom": "Nouveau Nom Site", "estPrincipal": true }
 * // Response: { "_id": "...", "nom": "Fournisseur ABC", "sites": [{ "_id": "...", "nom": "Nouveau Nom Site", "estPrincipal": true, ... }] }
 */
exports.updateSiteInFournisseur = async (req, res, next) => {
  try {
    const { id: fournisseurId, siteId } = req.params;
    const fournisseur = await Fournisseur.findById(fournisseurId);

    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }

    const site = fournisseur.sites.id(siteId);
    if (!site) {
      return next(new NotFoundError("Site non trouvé"));
    }

    // Si le site actuel est défini comme principal, tous les autres sont désactivés.
    if (req.body.estPrincipal === true) {
      fournisseur.sites.forEach((s) => {
        if (s._id.toString() !== siteId) {
          s.estPrincipal = false;
        }
      });
    }

    // Applique les modifications au sous-document.
    site.set(req.body);
    await fournisseur.save();
    res.json(fournisseur);
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver un site spécifique d'un fournisseur.
 */
exports.deactivateSite = async (req, res, next) => {
  try {
    const { id: fournisseurId, siteId } = req.params;
    const fournisseur = await Fournisseur.findById(fournisseurId);

    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }

    const site = fournisseur.sites.id(siteId);
    if (!site) {
      return next(new NotFoundError("Site non trouvé"));
    }

    site.isActive = false;
    
    // Business rule: If all sites are deactivated, deactivate the supplier
    const activeSitesCount = fournisseur.sites.filter(s => s.isActive && s._id.toString() !== siteId).length;
    let message = "Site désactivé avec succès";
    
    if (activeSitesCount === 0) {
      fournisseur.isActive = false;
      message = "Site désactivé avec succès. Le fournisseur a également été désactivé car tous ses sites sont inactifs.";
    }
    
    await fournisseur.save();
    
    res.json({ message });
  } catch (error) {
    next(error);
  }
};

/**
 * Réactiver un site spécifique d'un fournisseur.
 */
exports.reactivateSite = async (req, res, next) => {
  try {
    const { id: fournisseurId, siteId } = req.params;
    const fournisseur = await Fournisseur.findById(fournisseurId);

    if (!fournisseur) {
      return next(new NotFoundError("Fournisseur non trouvé"));
    }

    const site = fournisseur.sites.id(siteId);
    if (!site) {
      return next(new NotFoundError("Site non trouvé"));
    }

    site.isActive = true;
    
    // Business rule: If supplier was inactive and we're reactivating a site, reactivate the supplier
    let message = "Site réactivé avec succès";
    if (!fournisseur.isActive) {
      fournisseur.isActive = true;
      message = "Site réactivé avec succès. Le fournisseur a également été réactivé.";
    }
    
    await fournisseur.save();
    
    res.json({ message });
  } catch (error) {
    next(error);
  }
};


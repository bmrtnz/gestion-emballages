// backend/controllers/fournisseurController.js
const Fournisseur = require("../models/fournisseurModel");
const { NotFoundError, BadRequestError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @description Créer un nouveau fournisseur.
 * @route POST /api/fournisseurs
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.createFournisseur = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.create(req.body);
  res.status(201).json(fournisseur);
});

/**
 * @description Obtenir tous les fournisseurs actifs, triés par nom.
 * @route GET /api/fournisseurs
 * @access Privé
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getFournisseurs = asyncHandler(async (req, res, next) => {
  const fournisseurs = await Fournisseur.find({ isActive: true }).sort({ nom: 1 });
  res.json(fournisseurs);
});

/**
 * @description Mettre à jour un fournisseur par son ID.
 * @route PUT /api/fournisseurs/:id
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateFournisseur = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Désactiver un fournisseur (suppression logique ou "soft delete").
 * @route DELETE /api/fournisseurs/:id
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.deactivateFournisseur = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.findById(req.params.id);

  if (!fournisseur) {
    return next(new NotFoundError("Fournisseur non trouvé"));
  }

  fournisseur.isActive = false;
  await fournisseur.save();
  res.json({ message: "Fournisseur désactivé avec succès" });
});

/**
 * @description Ajouter un site à un fournisseur existant.
 * @route POST /api/fournisseurs/:id/sites
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.addSiteToFournisseur = asyncHandler(async (req, res, next) => {
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

  fournisseur.sites.push(nouveauSite);
  await fournisseur.save();
  res.status(201).json(fournisseur);
});

/**
 * @description Supprimer un site d'un fournisseur.
 * @route DELETE /api/fournisseurs/:id/sites/:siteId
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.deleteSiteFromFournisseur = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Mettre à jour un site spécifique d'un fournisseur.
 * @route PUT /api/fournisseurs/:id/sites/:siteId
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateSiteInFournisseur = asyncHandler(async (req, res, next) => {
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
});


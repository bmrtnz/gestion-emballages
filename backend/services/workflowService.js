// backend/services/workflowService.js

// --- Règles pour les Commandes Fournisseurs ---
const commandeWorkflowRules = {
  'Confirmée': {
    from: ['Enregistrée'],
    roles: ['Fournisseur'],
    isOwner: (user, commande) => user.entiteId && user.entiteId.equals(commande.fournisseurId),
  },
  'Expédiée': {
    from: ['Confirmée'],
    roles: ['Fournisseur'],
    isOwner: (user, commande) => user.entiteId && user.entiteId.equals(commande.fournisseurId),
  },
  'Réceptionnée': {
    from: ['Expédiée'],
    roles: ['Station'],
    isOwner: (user, commande) => user.entiteId && user.entiteId.equals(commande.stationId),
  },
  'Clôturée': {
    from: ['Réceptionnée'],
    roles: ['Station'],
    isOwner: (user, commande) => user.entiteId && user.entiteId.equals(commande.stationId),
  },
  'Facturée': {
    from: ['Clôturée'],
    roles: ['Gestionnaire', 'Manager'],
  },
  'Archivée': {
    from: ['Facturée'],
    roles: ['Gestionnaire', 'Manager'],
  }
};

// --- Règles pour les Demandes de Transfert ---
const transfertWorkflowRules = {
    'Confirmée': {
        from: ['Enregistrée'],
        roles: ['Station'],
        isOwner: (user, demande) => user.entiteId && user.entiteId.equals(demande.stationSourceId),
    },
    'Rejetée': {
        from: ['Enregistrée'],
        roles: ['Station'],
        isOwner: (user, demande) => user.entiteId && user.entiteId.equals(demande.stationSourceId),
    },
    'Traitée logistique': {
        from: ['Confirmée'],
        roles: ['Gestionnaire', 'Manager'],
    },
    'Expédiée': {
        from: ['Traitée logistique'],
        roles: ['Station'],
        isOwner: (user, demande) => user.entiteId && user.entiteId.equals(demande.stationSourceId),
    },
    'Réceptionnée': {
        from: ['Expédiée'],
        roles: ['Station'],
        isOwner: (user, demande) => user.entiteId && user.entiteId.equals(demande.stationDestinationId),
    },
    'Clôturée': {
        from: ['Réceptionnée'],
        roles: ['Station'],
        isOwner: (user, demande) => user.entiteId && user.entiteId.equals(demande.stationDestinationId),
    },
    'Traitée comptabilité': {
        from: ['Clôturée'],
        roles: ['Gestionnaire', 'Manager'],
    },
    'Archivée': {
        from: ['Traitée comptabilité'],
        roles: ['Gestionnaire', 'Manager'],
    }
};


/**
 * Checks if a user can transition a document to a new status based on a given set of rules.
 * @param {object} doc - The document (commande or demande de transfert).
 * @param {string} newStatus - The target status.
 * @param {object} user - The user performing the action.
 * @param {object} rules - The workflow rules to apply.
 * @returns {boolean} - True if the transition is allowed, false otherwise.
 */
function canTransition(doc, newStatus, user, rules) {
  const rule = rules[newStatus];
  if (!rule) return false;
  if (!rule.from.includes(doc.statut)) return false;
  if (!rule.roles.includes(user.role)) return false;
  if (rule.isOwner && !rule.isOwner(user, doc)) return false;
  return true;
}

/**
 * Returns a specific error message for a failed transition.
 * @param {object} doc - The document (commande or demande de transfert).
 *
 * @param {string} newStatus - The target status.
 * @param {object} user - The user performing the action.
 * @param {object} rules - The workflow rules to apply.
 * @returns {string} - A descriptive error message.
 */
function getTransitionError(doc, newStatus, user, rules) {
    const rule = rules[newStatus];
    if (!rule) return `Le statut "${newStatus}" est invalide.`;
    if (!rule.from.includes(doc.statut)) return `Le document ne peut passer au statut "${newStatus}" que depuis le statut "${rule.from.join(' ou ')}".`;
    if (!rule.roles.includes(user.role)) return 'Accès refusé. Droits insuffisants.';
    if (rule.isOwner && !rule.isOwner(user, doc)) return 'Action non autorisée. Vous n\'êtes pas le propriétaire de ce document.';
    return 'Une erreur inconnue est survenue lors de la validation du workflow.';
}

// --- Exports pour les Commandes ---
exports.canTransitionCommande = (commande, newStatus, user) => canTransition(commande, newStatus, user, commandeWorkflowRules);
exports.getTransitionCommandeError = (commande, newStatus, user) => getTransitionError(commande, newStatus, user, commandeWorkflowRules);

// --- Exports pour les Demandes de Transfert ---
exports.canTransitionDemande = (demande, newStatus, user) => canTransition(demande, newStatus, user, transfertWorkflowRules);
exports.getTransitionDemandeError = (demande, newStatus, user) => getTransitionError(demande, newStatus, user, transfertWorkflowRules);

// backend/services/commandeGlobaleService.js

const statusOrder = [
    'Enregistrée',
    'Confirmée',
    'Expédiée',
    'Réceptionnée',
    'Clôturée',
    'Facturée',
    'Archivée'
];

/**
 * Calculates the general status of a global command based on its child commands.
 * @param {Array} commandesFournisseurs - The array of provider command documents.
 * @returns {string} The calculated general status.
 */
function calculateStatutGeneral(commandesFournisseurs) {
    if (!commandesFournisseurs || commandesFournisseurs.length === 0) {
        return 'Vide'; // Or another default status
    }

    const totalCommandes = commandesFournisseurs.length;
    const statusCounts = new Map();
    commandesFournisseurs.forEach(cmd => {
        statusCounts.set(cmd.statut, (statusCounts.get(cmd.statut) || 0) + 1);
    });

    // Iterate from the most advanced status to the least
    for (let i = statusOrder.length - 1; i >= 0; i--) {
        const currentStatus = statusOrder[i];
        const count = statusCounts.get(currentStatus) || 0;

        if (count === totalCommandes) {
            // All commands are at this status
            return currentStatus;
        }
        if (count > 0) {
            // At least one command is at this status, but not all
            // For "Enregistrée", there is no "Partiellement" status
            if (currentStatus === 'Enregistrée') {
                 return 'Enregistrée';
            }
            return `Partiellement ${currentStatus.toLowerCase()}`;
        }
    }

    return 'Inconnu'; // Fallback
}

module.exports = { calculateStatutGeneral };

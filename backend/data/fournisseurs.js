// backend/data/fournisseurs.js
const fournisseurs = [
    {
        nom: 'Smurfit Westrock',
        siret: '493 254 908 00020',
        sites: [{
            nomSite: 'Site de Saint Seurin',
            estPrincipal: true,
            adresse: { rue: '1 Rue Jules Verne', codePostal: '33660', ville: 'Saint-Seurin-sur-l\'Isle', pays: 'France' },
            contact: { nom: 'Sophie Martin', email: 's.martin@smurfit.com', telephone: '0557498000' }
        }],
        documents: [{
            nomDocument: 'Certification ISO 9001',
            typeDocument: 'Qualité',
            urlStockage: 'placeholder_url_iso.pdf',
            dateExpiration: new Date('2026-12-31')
        }]
    },
    {
        nom: 'Raja',
        siret: '937 080 414 00066',
        sites: [{
            nomSite: 'Site principal',
            estPrincipal: true,
            adresse: { rue: '16 rue de l\'Étang', codePostal: '93290', ville: 'Tremblay-en-France', pays: 'France' },
            contact: { nom: 'Paul Leroi', email: 'p.leroi@raja.fr', telephone: '0149904990' }
        }]
    },
];
module.exports = fournisseurs;
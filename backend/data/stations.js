// backend/data/stations.js
const stations = [
    {
        nom: 'Stanor',
        identifiantInterne: 'ST-STANOR',
        adresse: {
            rue: '655 Rue des Pommes',
            codePostal: '82200',
            ville: 'Moissac',
            pays: 'France'
        },
        contactPrincipal: {
            nom: 'Franck Lagasse',
            email: 'f.lagasse@stanor.fr',
            telephone: '0563046010'
        }
    },
    {
        nom: 'Trois Domaines',
        identifiantInterne: 'ST-3D',
        adresse: {
            rue: 'Marché d\'Intérêt national, Av. d\'Aquitaine',
            codePostal: '47550',
            ville: 'Agen',
            pays: 'France'
        },
        contactPrincipal: {
            nom: 'Lucas Grard',
            email: 'l.grard@3d.fr',
            telephone: '0553964700'
        }
    },
];
module.exports = stations;
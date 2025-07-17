const fs = require('fs');

// Noms d'entreprises réalistes pour l'emballage
const companyNames = [
  'Smurfit Westrock', 'Raja', 'Antalis Packaging', 'Mondi Group', 'International Paper',
  'Stora Enso', 'Krones AG', 'Amcor', 'Sonoco Products', 'Crown Holdings',
  'Ball Corporation', 'CCL Industries', 'Sealed Air', 'Huhtamaki', 'Schott AG',
  'Gerresheimer', 'Sidel', 'Tetra Pak', 'Constantia Flexibles', 'Clondalkin Group',
  'Coveris', 'Plastipak', 'Berry Global', 'Silgan Holdings', 'AeroCanada',
  'Orora Packaging', 'Packaging Corporation', 'WestRock Company', 'Graphic Packaging',
  'Reynolds Group', 'Ampac Holdings', 'Genpak', 'Printpack', 'Pactiv Evergreen',
  'Tekni-Plex', 'Winpak', 'Bemis Company', 'Flextrus', 'Multi-Color Corporation',
  'CCL Label', 'Schur Flexibles', 'Uflex Limited', 'Nihon Dixie', 'Toppan Printing',
  'Dai Nippon Printing', 'Toyo Seikan', 'Quadpack', 'Alpla Group', 'Plastipak Holdings',
  'Nampak Limited', 'Oricon Enterprises'
];

// Villes françaises où peuvent être basés les fournisseurs
const frenchCities = [
  { ville: 'Paris', codePostal: '75001' },
  { ville: 'Lyon', codePostal: '69000' },
  { ville: 'Marseille', codePostal: '13000' },
  { ville: 'Toulouse', codePostal: '31000' },
  { ville: 'Lille', codePostal: '59000' },
  { ville: 'Bordeaux', codePostal: '33000' },
  { ville: 'Nantes', codePostal: '44000' },
  { ville: 'Strasbourg', codePostal: '67000' },
  { ville: 'Montpellier', codePostal: '34000' },
  { ville: 'Rennes', codePostal: '35000' },
  { ville: 'Reims', codePostal: '51100' },
  { ville: 'Saint-Étienne', codePostal: '42000' },
  { ville: 'Toulon', codePostal: '83000' },
  { ville: 'Grenoble', codePostal: '38000' },
  { ville: 'Dijon', codePostal: '21000' },
  { ville: 'Angers', codePostal: '49000' },
  { ville: 'Nîmes', codePostal: '30000' },
  { ville: 'Villeurbanne', codePostal: '69100' },
  { ville: 'Clermont-Ferrand', codePostal: '63000' },
  { ville: 'Le Havre', codePostal: '76600' },
  { ville: 'Amiens', codePostal: '80000' },
  { ville: 'Limoges', codePostal: '87000' },
  { ville: 'Tours', codePostal: '37000' },
  { ville: 'Perpignan', codePostal: '66000' },
  { ville: 'Metz', codePostal: '57000' },
  { ville: 'Besançon', codePostal: '25000' },
  { ville: 'Orléans', codePostal: '45000' },
  { ville: 'Mulhouse', codePostal: '68100' },
  { ville: 'Rouen', codePostal: '76000' },
  { ville: 'Caen', codePostal: '14000' },
  { ville: 'Nancy', codePostal: '54000' },
  { ville: 'Argenteuil', codePostal: '95100' },
  { ville: 'Montreuil', codePostal: '93100' },
  { ville: 'Roubaix', codePostal: '59100' },
  { ville: 'Tourcoing', codePostal: '59200' },
  { ville: 'Dunkerque', codePostal: '59140' },
  { ville: 'Nanterre', codePostal: '92000' },
  { ville: 'Créteil', codePostal: '94000' },
  { ville: 'Avignon', codePostal: '84000' },
  { ville: 'Poitiers', codePostal: '86000' },
  { ville: 'Aubervilliers', codePostal: '93300' },
  { ville: 'Champigny-sur-Marne', codePostal: '94500' },
  { ville: 'Saint-Maur-des-Fossés', codePostal: '94100' },
  { ville: 'Versailles', codePostal: '78000' },
  { ville: 'Colombes', codePostal: '92700' },
  { ville: 'Pau', codePostal: '64000' },
  { ville: 'Calais', codePostal: '62100' },
  { ville: 'Cannes', codePostal: '06400' },
  { ville: 'Boulogne-Billancourt', codePostal: '92100' },
  { ville: 'Bourges', codePostal: '18000' }
];

// Noms de contacts réalistes
const firstNames = [
  'Jean', 'Marie', 'Pierre', 'Michel', 'Alain', 'Philippe', 'Daniel', 'Bernard', 'Catherine', 'Françoise',
  'Monique', 'Sylvie', 'Isabelle', 'Martine', 'Brigitte', 'Jeanne', 'Chantal', 'Christine', 'Véronique', 'Jacqueline',
  'Nathalie', 'Laurence', 'Céline', 'Valérie', 'Sandrine', 'Julie', 'Émilie', 'Florence', 'Pascale', 'Dominique',
  'Thierry', 'Frédéric', 'Laurent', 'Olivier', 'Christophe', 'Nicolas', 'Sébastien', 'Vincent', 'Stéphane', 'Julien',
  'David', 'Éric', 'Didier', 'Pascal', 'Gérard', 'Patrice', 'François', 'Serge', 'Claude', 'André'
];

const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
  'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
  'Morel', 'Girard', 'André', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez',
  'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
  'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin'
];

// Spécialisations d'emballage
const specializations = [
  'Emballage alimentaire', 'Emballage industriel', 'Emballage cosmétique', 'Emballage pharmaceutique',
  'Emballage électronique', 'Emballage textile', 'Emballage chimique', 'Emballage automobile',
  'Emballage médical', 'Emballage logistique', 'Emballage e-commerce', 'Emballage luxe',
  'Emballage écologique', 'Emballage sur mesure', 'Emballage transport', 'Emballage protection'
];

// Fonction pour générer un SIRET aléatoire valide
function generateSIRET() {
  const siren = Math.floor(Math.random() * 900000000) + 100000000;
  const nic = Math.floor(Math.random() * 90000) + 10000;
  return `${siren.toString().substring(0, 3)} ${siren.toString().substring(3, 6)} ${siren.toString().substring(6)} ${nic.toString().substring(0, 2)}${nic.toString().substring(2)}`;
}

// Fonction pour générer un téléphone français
function generatePhoneNumber() {
  const indicatifs = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
  const indicatif = indicatifs[Math.floor(Math.random() * indicatifs.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  const numStr = number.toString().padStart(8, '0');
  return `${indicatif}${numStr.substring(0, 2)}${numStr.substring(2, 4)}${numStr.substring(4, 6)}${numStr.substring(6)}`;
}

// Fonction pour générer une adresse email
function generateEmail(firstName, lastName, companyName) {
  const cleanFirstName = firstName.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[ç]/g, 'c').replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u');
  const cleanLastName = lastName.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[ç]/g, 'c').replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u');
  const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  
  const formats = [
    `${cleanFirstName}.${cleanLastName}@${cleanCompany}.com`,
    `${cleanFirstName.charAt(0)}.${cleanLastName}@${cleanCompany}.fr`,
    `${cleanFirstName}@${cleanCompany}.com`,
    `${cleanLastName}@${cleanCompany}.fr`
  ];
  
  return formats[Math.floor(Math.random() * formats.length)];
}

// Fonction pour générer une adresse de rue
function generateStreetAddress() {
  const streetTypes = ['Rue', 'Avenue', 'Boulevard', 'Place', 'Allée', 'Chemin', 'Route', 'Impasse'];
  const streetNames = [
    'de la République', 'des Champs', 'du Commerce', 'de la Liberté', 'des Roses', 'de la Paix',
    'du Général de Gaulle', 'de la Gare', 'des Écoles', 'de la Mairie', 'du Marché', 'de l\'Église',
    'des Lilas', 'de la Victoire', 'du Stade', 'de la Fontaine', 'des Platanes', 'du Moulin',
    'des Tilleuls', 'de la Poste', 'du Château', 'de la Forêt', 'du Pont', 'des Jardins'
  ];
  
  const number = Math.floor(Math.random() * 200) + 1;
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  
  return `${number} ${streetType} ${streetName}`;
}

// Fonction pour générer un site avec adresse et contact
function generateSite(companyName, isMain = false) {
  const city = frenchCities[Math.floor(Math.random() * frenchCities.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    nomSite: isMain ? 'Site principal' : `Site de ${city.ville}`,
    estPrincipal: isMain,
    adresse: {
      rue: generateStreetAddress(),
      codePostal: city.codePostal,
      ville: city.ville,
      pays: 'France'
    },
    contact: {
      nom: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, companyName),
      telephone: generatePhoneNumber()
    }
  };
}

// Fonction pour générer des documents aléatoires
function generateDocuments() {
  const documentTypes = [
    { nom: 'Certification ISO 9001', type: 'Qualité' },
    { nom: 'Certification ISO 14001', type: 'Environnement' },
    { nom: 'Certification FSC', type: 'Développement durable' },
    { nom: 'Attestation d\'assurance', type: 'Assurance' },
    { nom: 'Certificat BRC', type: 'Sécurité alimentaire' },
    { nom: 'Agrément sanitaire', type: 'Santé' },
    { nom: 'Certification PEFC', type: 'Foresterie' },
    { nom: 'Fiche de sécurité', type: 'Sécurité' }
  ];
  
  const numDocs = Math.floor(Math.random() * 4) + 1; // 1 à 4 documents
  const selectedDocs = [];
  
  for (let i = 0; i < numDocs; i++) {
    const doc = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + Math.floor(Math.random() * 3) + 1); // 1 à 3 ans
    
    selectedDocs.push({
      nomDocument: doc.nom,
      typeDocument: doc.type,
      urlStockage: `placeholder_${doc.nom.toLowerCase().replace(/\s/g, '_')}.pdf`,
      dateExpiration: expirationDate
    });
  }
  
  return selectedDocs;
}

// Fonction principale pour générer les fournisseurs
function generateSuppliers(count = 50) {
  const suppliers = [];
  
  console.log(`Génération de ${count} fournisseurs...`);
  
  for (let i = 0; i < count; i++) {
    const companyName = companyNames[i % companyNames.length];
    const numSites = Math.floor(Math.random() * 3) + 1; // 1 à 3 sites
    const sites = [];
    
    // Premier site = site principal
    sites.push(generateSite(companyName, true));
    
    // Sites supplémentaires
    for (let j = 1; j < numSites; j++) {
      sites.push(generateSite(companyName, false));
    }
    
    const supplier = {
      nom: `${companyName} ${i > companyNames.length - 1 ? 'Group' : ''}`.trim(),
      siret: generateSIRET(),
      specialisation: specializations[Math.floor(Math.random() * specializations.length)],
      sites: sites,
      documents: generateDocuments(),
      isActive: Math.random() > 0.05 // 95% actifs
    };
    
    suppliers.push(supplier);
    
    if ((i + 1) % 10 === 0) {
      console.log(`${i + 1} fournisseurs générés...`);
    }
  }
  
  console.log(`${count} fournisseurs générés avec succès !`);
  return suppliers;
}

// Génération et sauvegarde
const suppliers = generateSuppliers(50);
fs.writeFileSync(`${__dirname}/suppliers.json`, JSON.stringify(suppliers, null, 2));
console.log('Fournisseurs sauvegardés dans suppliers.json');

// Statistiques
const stats = suppliers.reduce((acc, supplier) => {
  acc.totalSites += supplier.sites.length;
  acc.totalDocuments += supplier.documents.length;
  acc.active += supplier.isActive ? 1 : 0;
  
  if (acc.specializations[supplier.specialisation]) {
    acc.specializations[supplier.specialisation]++;
  } else {
    acc.specializations[supplier.specialisation] = 1;
  }
  
  return acc;
}, { totalSites: 0, totalDocuments: 0, active: 0, specializations: {} });

console.log('\n=== STATISTIQUES ===');
console.log(`Total de fournisseurs: ${suppliers.length}`);
console.log(`Fournisseurs actifs: ${stats.active}`);
console.log(`Fournisseurs inactifs: ${suppliers.length - stats.active}`);
console.log(`Total de sites: ${stats.totalSites}`);
console.log(`Total de documents: ${stats.totalDocuments}`);
console.log(`Moyenne de sites par fournisseur: ${(stats.totalSites / suppliers.length).toFixed(2)}`);
console.log(`Moyenne de documents par fournisseur: ${(stats.totalDocuments / suppliers.length).toFixed(2)}`);

console.log('\nSpécialisations:');
Object.entries(stats.specializations).forEach(([spec, count]) => {
  console.log(`  ${spec}: ${count} fournisseurs`);
});

module.exports = suppliers;
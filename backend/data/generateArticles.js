const fs = require('fs');

// Catégories d'articles
const categories = [
  'Barquette',
  'Cagette', 
  'Plateau',
  'Film Plastique',
  'Carton',
  'Sac Plastique',
  'Sac Papier',
  'Emballage Isotherme',
  'Etiquette',
  'Autre'
];

// Préfixes pour les désignations selon la catégorie
const designationPrefixes = {
  'Barquette': ['Barquette', 'Bac', 'Récipient'],
  'Cagette': ['Cagette', 'Caisse', 'Cageot'],
  'Plateau': ['Plateau', 'Planche', 'Support'],
  'Film Plastique': ['Film', 'Pellicule', 'Rouleau'],
  'Carton': ['Carton', 'Boîte', 'Emballage'],
  'Sac Plastique': ['Sac', 'Sachet', 'Poche'],
  'Sac Papier': ['Sac papier', 'Sachet papier', 'Emballage papier'],
  'Emballage Isotherme': ['Emballage isotherme', 'Caisse isotherme', 'Conteneur'],
  'Etiquette': ['Etiquette', 'Autocollant', 'Label'],
  'Autre': ['Accessoire', 'Outillage', 'Matériel']
};

// Matériaux
const materials = [
  'Plastique',
  'Carton',
  'Papier',
  'Polystyrène',
  'Biodégradable',
  'Recyclable',
  'Kraft',
  'PET',
  'PP',
  'PE'
];

// Dimensions communes
const dimensions = [
  '10x8x3',
  '15x10x5',
  '20x15x7',
  '25x20x10',
  '30x25x12',
  '35x30x15',
  '40x35x18',
  '50x40x20',
  '60x40x25',
  '80x60x30'
];

// Couleurs
const colors = [
  'Blanc',
  'Transparent',
  'Noir',
  'Rouge',
  'Bleu',
  'Vert',
  'Jaune',
  'Gris',
  'Marron',
  'Rose'
];

// Fonction pour générer un code article unique
function generateArticleCode(index) {
  const prefix = categories[index % categories.length].substring(0, 3).toUpperCase();
  const number = String(index + 1).padStart(4, '0');
  return `${prefix}${number}`;
}

// Fonction pour générer une désignation
function generateDesignation(category, index) {
  const prefixes = designationPrefixes[category];
  const prefix = prefixes[index % prefixes.length];
  const material = materials[index % materials.length];
  const dimension = dimensions[index % dimensions.length];
  const color = colors[index % colors.length];
  
  // Variations dans la construction des désignations
  const variations = [
    `${prefix} ${material} ${dimension}`,
    `${prefix} ${color} ${dimension}`,
    `${prefix} ${material} ${color}`,
    `${prefix} ${dimension} ${color}`,
    `${prefix} ${material}`,
    `${prefix} ${color}`,
    `${prefix} ${dimension}`
  ];
  
  return variations[index % variations.length];
}

// Fonction pour générer des références fournisseur
function generateSupplierReference(supplierIndex, articleIndex) {
  const supplierPrefixes = [
    'SMW', 'RJA', 'ANT', 'MON', 'INP', 'STO', 'KRO', 'AMC', 'SON', 'CRO',
    'BAL', 'CCL', 'SEA', 'HUH', 'SCH', 'GER', 'SID', 'TET', 'CON', 'CLO',
    'COV', 'PLA', 'BER', 'SIL', 'AER', 'ORO', 'PAC', 'WES', 'GRA', 'REY',
    'AMP', 'GEN', 'PRI', 'PAE', 'TEK', 'WIN', 'BEM', 'FLE', 'MCC', 'LAB',
    'SCF', 'UFL', 'NIH', 'TOP', 'DAI', 'TOY', 'QUA', 'ALP', 'PLH', 'NAM'
  ];
  const prefix = supplierPrefixes[supplierIndex % supplierPrefixes.length];
  const number = String(articleIndex + 1).padStart(6, '0');
  return `${prefix}-${number}`;
}

// Fonction pour générer un prix aléatoire
function generatePrice(category, index) {
  const basePrices = {
    'Barquette': { min: 0.10, max: 2.50 },
    'Cagette': { min: 0.50, max: 5.00 },
    'Plateau': { min: 0.20, max: 3.00 },
    'Film Plastique': { min: 15.00, max: 80.00 },
    'Carton': { min: 0.30, max: 4.00 },
    'Sac Plastique': { min: 0.05, max: 0.50 },
    'Sac Papier': { min: 0.08, max: 0.80 },
    'Emballage Isotherme': { min: 5.00, max: 25.00 },
    'Etiquette': { min: 0.01, max: 0.15 },
    'Autre': { min: 0.50, max: 10.00 }
  };
  
  const priceRange = basePrices[category] || { min: 0.10, max: 5.00 };
  const variation = (index * 0.123) % 1; // Pseudo-aléatoire basé sur l'index
  const price = priceRange.min + (priceRange.max - priceRange.min) * variation;
  return Math.round(price * 100) / 100; // Arrondi à 2 décimales
}

// Fonction pour générer les informations fournisseur
function generateSupplierInfo(articleIndex, supplierIds) {
  const suppliers = [];
  const numSuppliers = Math.min((articleIndex % 4) + 1, 3); // 1 à 3 fournisseurs par article
  
  // Sélection pseudo-aléatoire des fournisseurs pour cet article
  const selectedSupplierIndices = [];
  for (let i = 0; i < numSuppliers; i++) {
    let supplierIndex;
    do {
      supplierIndex = (articleIndex * 7 + i * 13) % supplierIds.length; // Distribution pseudo-aléatoire
    } while (selectedSupplierIndices.includes(supplierIndex));
    selectedSupplierIndices.push(supplierIndex);
  }
  
  for (let i = 0; i < numSuppliers; i++) {
    const supplierIndex = selectedSupplierIndices[i];
    const category = categories[articleIndex % categories.length];
    
    suppliers.push({
      fournisseurId: supplierIds[supplierIndex],
      referenceFournisseur: generateSupplierReference(supplierIndex, articleIndex),
      prixUnitaire: generatePrice(category, articleIndex + i),
      uniteConditionnement: ['Unité', 'Paquet', 'Carton', 'Palette'][i % 4],
      quantiteParConditionnement: [1, 10, 25, 50, 100, 250, 500][(articleIndex + i) % 7],
      documents: []
    });
  }
  
  return suppliers;
}

// Fonction principale pour générer les articles
function generateArticles(count = 2000) {
  const articles = [];
  
  // IDs des fournisseurs (ces IDs seront remplacés par les vrais IDs lors de l'import)
  const supplierIds = [];
  for (let i = 0; i < 50; i++) {
    supplierIds.push(`SUPPLIER_${i + 1}_ID`);
  }
  
  console.log(`Génération de ${count} articles...`);
  
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    
    const article = {
      codeArticle: generateArticleCode(i),
      designation: generateDesignation(category, i),
      categorie: category,
      isActive: Math.random() > 0.05, // 95% des articles sont actifs
      fournisseurs: generateSupplierInfo(i, supplierIds)
    };
    
    articles.push(article);
    
    // Affichage du progrès
    if ((i + 1) % 200 === 0) {
      console.log(`${i + 1} articles générés...`);
    }
  }
  
  console.log(`${count} articles générés avec succès !`);
  return articles;
}

// Génération et sauvegarde
const articles = generateArticles(2000);
fs.writeFileSync(`${__dirname}/articles.json`, JSON.stringify(articles, null, 2));
console.log('Articles sauvegardés dans articles.json');

// Affichage de quelques statistiques
const stats = articles.reduce((acc, article) => {
  acc.categories[article.categorie] = (acc.categories[article.categorie] || 0) + 1;
  acc.totalSuppliers += article.fournisseurs.length;
  acc.active += article.isActive ? 1 : 0;
  return acc;
}, { categories: {}, totalSuppliers: 0, active: 0 });

console.log('\n=== STATISTIQUES ===');
console.log(`Total d'articles: ${articles.length}`);
console.log(`Articles actifs: ${stats.active}`);
console.log(`Articles inactifs: ${articles.length - stats.active}`);
console.log(`Total de liens fournisseurs: ${stats.totalSuppliers}`);
console.log(`Moyenne de fournisseurs par article: ${(stats.totalSuppliers / articles.length).toFixed(2)}`);
console.log('\nRépartition par catégorie:');
Object.entries(stats.categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} articles`);
});
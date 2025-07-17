const mongoose = require('mongoose');
const Article = require('../models/articleModel');
const Fournisseur = require('../models/fournisseurModel');
const User = require('../models/userModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI_LOCAL).then(async () => {
  const articleCount = await Article.countDocuments();
  const supplierCount = await Fournisseur.countDocuments();
  const userCount = await User.countDocuments();
  
  console.log('=== STATISTIQUES BASE DE DONNÉES ===');
  console.log('Articles:', articleCount);
  console.log('Fournisseurs:', supplierCount);
  console.log('Utilisateurs:', userCount);
  
  // Compter les liens fournisseurs
  const totalLinks = await Article.aggregate([
    { $unwind: '$fournisseurs' },
    { $count: 'totalLinks' }
  ]);
  
  console.log('Liens fournisseurs:', totalLinks[0]?.totalLinks || 0);
  
  // Top 10 fournisseurs avec le plus d'articles
  const topSuppliers = await Article.aggregate([
    { $unwind: '$fournisseurs' },
    { $lookup: { from: 'fournisseurs', localField: 'fournisseurs.fournisseurId', foreignField: '_id', as: 'supplier' } },
    { $unwind: '$supplier' },
    { $group: { _id: '$supplier.nom', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log('\n=== TOP 10 FOURNISSEURS (liens articles) ===');
  topSuppliers.forEach(stat => {
    console.log(stat._id + ':', stat.count, 'articles');
  });
  
  process.exit();
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
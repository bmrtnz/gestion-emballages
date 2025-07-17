const mongoose = require('mongoose');
const Fournisseur = require('../models/fournisseurModel');
const User = require('../models/userModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI_LOCAL).then(async () => {
  const supplierCount = await Fournisseur.countDocuments();
  const activeSuppliers = await Fournisseur.countDocuments({ isActive: true });
  const supplierUsers = await User.countDocuments({ role: 'Fournisseur' });
  const activeSupplierUsers = await User.countDocuments({ role: 'Fournisseur', isActive: true });
  const totalUsers = await User.countDocuments();
  
  console.log('=== STATISTIQUES UTILISATEURS ET FOURNISSEURS ===');
  console.log('Fournisseurs:', supplierCount);
  console.log('Fournisseurs actifs:', activeSuppliers);
  console.log('Utilisateurs fournisseurs:', supplierUsers);
  console.log('Utilisateurs fournisseurs actifs:', activeSupplierUsers);
  console.log('Total utilisateurs:', totalUsers);
  
  console.log('\n=== VÉRIFICATION DES LIENS ===');
  const suppliersWithUsers = await Fournisseur.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'entiteId',
        as: 'users'
      }
    },
    {
      $project: {
        nom: 1,
        isActive: 1,
        hasUser: { $gt: [{ $size: '$users' }, 0] },
        userCount: { $size: '$users' }
      }
    }
  ]);
  
  const withUsers = suppliersWithUsers.filter(s => s.hasUser).length;
  const withoutUsers = suppliersWithUsers.filter(s => !s.hasUser).length;
  
  console.log('Fournisseurs avec utilisateur:', withUsers);
  console.log('Fournisseurs sans utilisateur:', withoutUsers);
  
  if (withoutUsers > 0) {
    console.log('\nFournisseurs sans utilisateur:');
    suppliersWithUsers.filter(s => !s.hasUser).forEach(s => {
      console.log('- ' + s.nom);
    });
  }
  
  // Vérifier les sites
  console.log('\n=== VÉRIFICATION DES SITES ===');
  const allSuppliers = await Fournisseur.find();
  let totalSites = 0;
  let activeSites = 0;
  
  allSuppliers.forEach(supplier => {
    totalSites += supplier.sites.length;
    activeSites += supplier.sites.filter(site => site.isActive).length;
  });
  
  console.log('Total sites:', totalSites);
  console.log('Sites actifs:', activeSites);
  
  process.exit();
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
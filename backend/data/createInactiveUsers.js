const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI_LOCAL).then(async () => {
  console.log('=== CRÉATION D\'UTILISATEURS INACTIFS POUR TEST ===');
  
  // Désactiver 5 utilisateurs fournisseurs aléatoires
  const activeSuppliers = await User.find({ role: 'Fournisseur', isActive: true }).limit(5);
  
  for (const user of activeSuppliers) {
    user.isActive = false;
    await user.save();
    console.log('Désactivé:', user.nomComplet);
  }
  
  // Désactiver 1 utilisateur station
  const activeStation = await User.findOne({ role: 'Station', isActive: true });
  if (activeStation) {
    activeStation.isActive = false;
    await activeStation.save();
    console.log('Désactivé:', activeStation.nomComplet);
  }
  
  // Statistiques finales
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });
  
  console.log('\n=== STATISTIQUES FINALES ===');
  console.log('Total utilisateurs:', totalUsers);
  console.log('Utilisateurs actifs:', activeUsers);
  console.log('Utilisateurs inactifs:', inactiveUsers);
  
  // Répartition par rôle des inactifs
  const inactiveByRole = await User.aggregate([
    { $match: { isActive: false } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n=== UTILISATEURS INACTIFS PAR RÔLE ===');
  inactiveByRole.forEach(stat => {
    console.log(stat._id + ':', stat.count);
  });
  
  console.log('\n✅ Utilisateurs inactifs créés pour tester la fonctionnalité de filtrage !');
  
  process.exit();
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
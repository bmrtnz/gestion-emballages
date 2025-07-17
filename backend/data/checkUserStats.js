const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI_LOCAL).then(async () => {
  console.log('=== STATISTIQUES UTILISATEURS ===');
  
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });
  
  console.log('Total utilisateurs:', totalUsers);
  console.log('Utilisateurs actifs:', activeUsers);
  console.log('Utilisateurs inactifs:', inactiveUsers);
  
  // Par rôle
  const roleStats = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n=== RÉPARTITION PAR RÔLE ===');
  roleStats.forEach(stat => {
    console.log(stat._id + ':', stat.count);
  });
  
  // Échantillon de noms
  const sampleUsers = await User.find().limit(10).select('nomComplet role isActive');
  console.log('\n=== ÉCHANTILLON D\'UTILISATEURS ===');
  sampleUsers.forEach(user => {
    console.log(user.nomComplet + ' - ' + user.role + ' - ' + (user.isActive ? 'Actif' : 'Inactif'));
  });
  
  process.exit();
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
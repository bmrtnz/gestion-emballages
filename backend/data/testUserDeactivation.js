const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI_LOCAL).then(async () => {
  console.log('=== TEST DÉSACTIVATION UTILISATEUR ===');
  
  // Trouver un utilisateur fournisseur actif
  const activeUser = await User.findOne({ role: 'Fournisseur', isActive: true });
  if (!activeUser) {
    console.log('Aucun utilisateur fournisseur actif trouvé');
    process.exit();
  }
  
  console.log('Utilisateur sélectionné:', activeUser.nomComplet);
  console.log('Statut avant:', activeUser.isActive ? 'Actif' : 'Inactif');
  
  // Désactiver l'utilisateur
  activeUser.isActive = false;
  await activeUser.save();
  
  console.log('Statut après désactivation:', activeUser.isActive ? 'Actif' : 'Inactif');
  
  // Statistiques mises à jour
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });
  
  console.log('\n=== STATISTIQUES MISES À JOUR ===');
  console.log('Total utilisateurs:', totalUsers);
  console.log('Utilisateurs actifs:', activeUsers);
  console.log('Utilisateurs inactifs:', inactiveUsers);
  
  // Réactiver l'utilisateur
  console.log('\n=== RÉACTIVATION ===');
  activeUser.isActive = true;
  await activeUser.save();
  
  console.log('Utilisateur réactivé:', activeUser.nomComplet);
  console.log('Statut final:', activeUser.isActive ? 'Actif' : 'Inactif');
  
  process.exit();
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
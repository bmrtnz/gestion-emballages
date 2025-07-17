const mongoose = require('mongoose');
const Fournisseur = require('../models/fournisseurModel');
const User = require('../models/userModel');
require('dotenv').config();

// Connexion à la DB
mongoose.connect(process.env.MONGO_URI_LOCAL)
    .then(() => console.log('MongoDB connecté pour test de désactivation en cascade'))
    .catch(err => console.error(err));

const testCascadeDeactivation = async () => {
    try {
        console.log('=== TEST DE DÉSACTIVATION EN CASCADE ===\n');
        
        // Étape 1: Sélectionner un fournisseur actif avec ses sites et utilisateur
        const activeSupplier = await Fournisseur.findOne({ isActive: true });
        if (!activeSupplier) {
            console.log('Aucun fournisseur actif trouvé');
            return;
        }
        
        const supplierUser = await User.findOne({ 
            entiteId: activeSupplier._id, 
            role: 'Fournisseur' 
        });
        
        console.log('AVANT DÉSACTIVATION:');
        console.log(`Fournisseur: ${activeSupplier.nom}`);
        console.log(`  - isActive: ${activeSupplier.isActive}`);
        console.log(`  - Sites actifs: ${activeSupplier.sites.filter(s => s.isActive).length}/${activeSupplier.sites.length}`);
        console.log(`  - Utilisateur associé: ${supplierUser ? supplierUser.nomComplet : 'Aucun'}`);
        console.log(`  - Utilisateur actif: ${supplierUser ? supplierUser.isActive : 'N/A'}`);
        
        // Étape 2: Désactiver le fournisseur
        console.log('\n--- DÉSACTIVATION DU FOURNISSEUR ---');
        activeSupplier.isActive = false;
        await activeSupplier.save();
        
        // Étape 3: Vérifier l'état après désactivation
        const deactivatedSupplier = await Fournisseur.findById(activeSupplier._id);
        const deactivatedUser = await User.findOne({ 
            entiteId: activeSupplier._id, 
            role: 'Fournisseur' 
        });
        
        console.log('\nAPRÈS DÉSACTIVATION (via .save()):');
        console.log(`Fournisseur: ${deactivatedSupplier.nom}`);
        console.log(`  - isActive: ${deactivatedSupplier.isActive}`);
        console.log(`  - Sites actifs: ${deactivatedSupplier.sites.filter(s => s.isActive).length}/${deactivatedSupplier.sites.length}`);
        console.log(`  - Utilisateur associé: ${deactivatedUser ? deactivatedUser.nomComplet : 'Aucun'}`);
        console.log(`  - Utilisateur actif: ${deactivatedUser ? deactivatedUser.isActive : 'N/A'}`);
        
        // Étape 4: Réactiver le fournisseur pour test findOneAndUpdate
        console.log('\n--- RÉACTIVATION POUR TEST findOneAndUpdate ---');
        await Fournisseur.findByIdAndUpdate(activeSupplier._id, { isActive: true });
        await User.updateMany(
            { entiteId: activeSupplier._id, role: 'Fournisseur' },
            { isActive: true }
        );
        
        // Réactiver manuellement les sites
        const reactivatedSupplier = await Fournisseur.findById(activeSupplier._id);
        reactivatedSupplier.sites.forEach(site => site.isActive = true);
        await reactivatedSupplier.save();
        
        console.log('Fournisseur réactivé');
        
        // Étape 5: Test avec findOneAndUpdate
        console.log('\n--- DÉSACTIVATION VIA findOneAndUpdate ---');
        await Fournisseur.findByIdAndUpdate(activeSupplier._id, { isActive: false });
        
        // Vérifier l'état après findOneAndUpdate
        const finalSupplier = await Fournisseur.findById(activeSupplier._id);
        const finalUser = await User.findOne({ 
            entiteId: activeSupplier._id, 
            role: 'Fournisseur' 
        });
        
        console.log('\nAPRÈS DÉSACTIVATION (via findOneAndUpdate):');
        console.log(`Fournisseur: ${finalSupplier.nom}`);
        console.log(`  - isActive: ${finalSupplier.isActive}`);
        console.log(`  - Sites actifs: ${finalSupplier.sites.filter(s => s.isActive).length}/${finalSupplier.sites.length}`);
        console.log(`  - Utilisateur associé: ${finalUser ? finalUser.nomComplet : 'Aucun'}`);
        console.log(`  - Utilisateur actif: ${finalUser ? finalUser.isActive : 'N/A'}`);
        
        // Étape 6: Statistiques finales
        console.log('\n=== STATISTIQUES FINALES ===');
        const totalSuppliers = await Fournisseur.countDocuments();
        const activeSuppliers = await Fournisseur.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments({ role: 'Fournisseur' });
        const activeUsers = await User.countDocuments({ role: 'Fournisseur', isActive: true });
        
        console.log(`Fournisseurs: ${activeSuppliers}/${totalSuppliers} actifs`);
        console.log(`Utilisateurs fournisseurs: ${activeUsers}/${totalUsers} actifs`);
        
        // Réactiver le fournisseur de test
        console.log('\n--- RÉACTIVATION FINALE ---');
        await Fournisseur.findByIdAndUpdate(activeSupplier._id, { isActive: true });
        await User.updateMany(
            { entiteId: activeSupplier._id, role: 'Fournisseur' },
            { isActive: true }
        );
        
        const finalReactivated = await Fournisseur.findById(activeSupplier._id);
        finalReactivated.sites.forEach(site => site.isActive = true);
        await finalReactivated.save();
        
        console.log('Fournisseur de test réactivé');
        console.log('\n✅ Test terminé avec succès !');
        
    } catch (error) {
        console.error('Erreur lors du test:', error);
    } finally {
        process.exit();
    }
};

testCascadeDeactivation();
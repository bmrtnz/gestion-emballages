const mongoose = require('mongoose');
const Fournisseur = require('../models/fournisseurModel');
const User = require('../models/userModel');

describe('Fournisseur Cascade Deactivation', () => {
    let fournisseur;
    let user;

    beforeEach(async () => {
        // Créer un fournisseur de test
        fournisseur = await Fournisseur.create({
            nom: 'Test Supplier',
            siret: '123456789',
            specialisation: 'Emballage test',
            sites: [
                {
                    nomSite: 'Site principal',
                    estPrincipal: true,
                    isActive: true,
                    adresse: {
                        rue: '123 Test Street',
                        codePostal: '12345',
                        ville: 'Test City',
                        pays: 'France'
                    },
                    contact: {
                        nom: 'Test Contact',
                        email: 'test@test.com',
                        telephone: '0123456789'
                    }
                },
                {
                    nomSite: 'Site secondaire',
                    estPrincipal: false,
                    isActive: true,
                    adresse: {
                        rue: '456 Test Avenue',
                        codePostal: '67890',
                        ville: 'Test Town',
                        pays: 'France'
                    },
                    contact: {
                        nom: 'Test Contact 2',
                        email: 'test2@test.com',
                        telephone: '0987654321'
                    }
                }
            ],
            isActive: true
        });

        // Créer un utilisateur lié au fournisseur
        user = await User.create({
            email: 'supplier@test.com',
            password: 'password123',
            role: 'Fournisseur',
            nomComplet: 'Test Supplier User',
            entiteId: fournisseur._id,
            isActive: true
        });
    });

    afterEach(async () => {
        await Fournisseur.deleteMany({});
        await User.deleteMany({});
    });

    describe('Cascade deactivation via save()', () => {
        it('should deactivate all sites when supplier is deactivated', async () => {
            // Vérifier l'état initial
            expect(fournisseur.isActive).toBe(true);
            expect(fournisseur.sites.every(site => site.isActive)).toBe(true);

            // Désactiver le fournisseur
            fournisseur.isActive = false;
            await fournisseur.save();

            // Vérifier que tous les sites sont désactivés
            expect(fournisseur.sites.every(site => site.isActive === false)).toBe(true);
        });

        it('should deactivate associated user when supplier is deactivated', async () => {
            // Vérifier l'état initial
            expect(user.isActive).toBe(true);

            // Désactiver le fournisseur
            fournisseur.isActive = false;
            await fournisseur.save();

            // Vérifier que l'utilisateur est désactivé
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.isActive).toBe(false);
        });
    });

    describe('Cascade deactivation via findOneAndUpdate()', () => {
        it('should deactivate all sites when supplier is deactivated via findOneAndUpdate', async () => {
            // Désactiver le fournisseur via findOneAndUpdate
            await Fournisseur.findByIdAndUpdate(fournisseur._id, { isActive: false });

            // Vérifier que tous les sites sont désactivés
            const updatedFournisseur = await Fournisseur.findById(fournisseur._id);
            expect(updatedFournisseur.isActive).toBe(false);
            expect(updatedFournisseur.sites.every(site => site.isActive === false)).toBe(true);
        });

        it('should deactivate associated user when supplier is deactivated via findOneAndUpdate', async () => {
            // Désactiver le fournisseur via findOneAndUpdate
            await Fournisseur.findByIdAndUpdate(fournisseur._id, { isActive: false });

            // Vérifier que l'utilisateur est désactivé
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.isActive).toBe(false);
        });
    });

    describe('Cascade deactivation via $set', () => {
        it('should deactivate all sites when supplier is deactivated via $set', async () => {
            // Désactiver le fournisseur via $set
            await Fournisseur.findByIdAndUpdate(fournisseur._id, { $set: { isActive: false } });

            // Vérifier que tous les sites sont désactivés
            const updatedFournisseur = await Fournisseur.findById(fournisseur._id);
            expect(updatedFournisseur.isActive).toBe(false);
            expect(updatedFournisseur.sites.every(site => site.isActive === false)).toBe(true);
        });

        it('should deactivate associated user when supplier is deactivated via $set', async () => {
            // Désactiver le fournisseur via $set
            await Fournisseur.findByIdAndUpdate(fournisseur._id, { $set: { isActive: false } });

            // Vérifier que l'utilisateur est désactivé
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.isActive).toBe(false);
        });
    });

    describe('No cascade when supplier remains active', () => {
        it('should not affect sites when supplier remains active', async () => {
            // Mettre à jour autre chose que isActive
            await Fournisseur.findByIdAndUpdate(fournisseur._id, { siret: '987654321' });

            // Vérifier que les sites restent actifs
            const updatedFournisseur = await Fournisseur.findById(fournisseur._id);
            expect(updatedFournisseur.isActive).toBe(true);
            expect(updatedFournisseur.sites.every(site => site.isActive)).toBe(true);
        });

        it('should not affect user when supplier remains active', async () => {
            // Mettre à jour autre chose que isActive
            await Fournisseur.findByIdAndUpdate(fournisseur._id, { siret: '987654321' });

            // Vérifier que l'utilisateur reste actif
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.isActive).toBe(true);
        });
    });

    describe('Multiple users handling', () => {
        it('should deactivate all users linked to the supplier', async () => {
            // Créer un deuxième utilisateur pour le même fournisseur
            const user2 = await User.create({
                email: 'supplier2@test.com',
                password: 'password123',
                role: 'Fournisseur',
                nomComplet: 'Test Supplier User 2',
                entiteId: fournisseur._id,
                isActive: true
            });

            // Désactiver le fournisseur
            fournisseur.isActive = false;
            await fournisseur.save();

            // Vérifier que tous les utilisateurs sont désactivés
            const updatedUser1 = await User.findById(user._id);
            const updatedUser2 = await User.findById(user2._id);
            
            expect(updatedUser1.isActive).toBe(false);
            expect(updatedUser2.isActive).toBe(false);

            // Nettoyer
            await User.findByIdAndDelete(user2._id);
        });
    });
});
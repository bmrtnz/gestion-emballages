// backend/tests/commandeController.test.js
const {
    getCommandeById,
    updateCommandeStatut,
    getCommandes,
    deleteCommande,
} = require('../controllers/commandeController');
const Commande = require('../models/commandeModel');
const CommandeGlobale = require('../models/commandeGlobaleModel');
const commandeService = require('../services/commandeService');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/appError');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../models/commandeModel');
jest.mock('../models/commandeGlobaleModel');
jest.mock('../services/commandeService');

describe('Commande Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = {
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('getCommandeById', () => {
        it('should return a commande with populated fields if found', async () => {
            const commande = { _id: 'commandeId' };
            const populate3 = jest.fn().mockResolvedValue(commande);
            const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
            const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
            Commande.findById.mockReturnValue({ populate: populate1 });
            req = { params: { id: 'commandeId' } };

            await getCommandeById(req, res, next);

            expect(Commande.findById).toHaveBeenCalledWith('commandeId');
            expect(res.json).toHaveBeenCalledWith(commande);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with NotFoundError if commande is not found', async () => {
            const populate3 = jest.fn().mockResolvedValue(null);
            const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
            const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
            Commande.findById.mockReturnValue({ populate: populate1 });
            req = { params: { id: 'nonExistentId' } };

            await getCommandeById(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe('updateCommandeStatut', () => {
        it('should call the service and return the updated commande', async () => {
            const updatedCommande = { _id: 'commandeId', statut: 'Confirmée' };
            commandeService.updateStatusCommande.mockResolvedValue(updatedCommande);
            req = { params: { id: 'commandeId' }, body: { statut: 'Confirmée' }, user: {} };

            await updateCommandeStatut(req, res, next);

            expect(commandeService.updateStatusCommande).toHaveBeenCalledWith('commandeId', 'Confirmée', {}, req.body);
            expect(res.json).toHaveBeenCalledWith(updatedCommande);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getCommandes', () => {
        it('should filter commandes by fournisseurId for Fournisseur role', async () => {
            const commandes = [{ _id: 'cmd1' }];
            const sort = jest.fn().mockResolvedValue(commandes);
            const populate3 = jest.fn().mockReturnValue({ sort });
            const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
            const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
            Commande.find.mockReturnValue({ populate: populate1 });
            req = { user: { role: 'Fournisseur', entiteId: 'fournisseurId' } };

            await getCommandes(req, res, next);

            expect(Commande.find).toHaveBeenCalledWith({ fournisseurId: 'fournisseurId' });
            expect(res.json).toHaveBeenCalledWith(commandes);
        });
    });

    describe('deleteCommande', () => {
        it('should successfully delete a commande', async () => {
            const stationId = new mongoose.Types.ObjectId();
            const commande = {
                _id: 'commandeId',
                stationId: stationId,
                statut: 'Enregistrée',
                commandeGlobaleId: 'globalId'
            };
            Commande.findById.mockResolvedValue(commande);
            Commande.findByIdAndDelete.mockResolvedValue(true);
            const mockCommandeGlobale = {
                commandesFournisseurs: { pull: jest.fn() },
                save: jest.fn().mockResolvedValue(true)
            };
            CommandeGlobale.findById.mockResolvedValue(mockCommandeGlobale);

            req = { params: { id: 'commandeId' }, user: { role: 'Station', entiteId: stationId } };

            await deleteCommande(req, res, next);

            expect(Commande.findByIdAndDelete).toHaveBeenCalledWith('commandeId');
            expect(res.json).toHaveBeenCalledWith({ message: 'Commande fournisseur annulée avec succès.' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});

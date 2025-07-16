// backend/tests/commandeGlobaleController.test.js
const { getCommandesGlobales, deleteCommandeGlobale } = require('../controllers/commandeGlobaleController');
const CommandeGlobale = require('../models/commandeGlobaleModel');
const Commande = require('../models/commandeModel');
const minioClient = require('../config/minioClient').minioClient;
const { NotFoundError } = require('../utils/appError');

jest.mock('../models/commandeGlobaleModel');
jest.mock('../models/commandeModel');
jest.mock('../config/minioClient', () => ({
    minioClient: {
        removeObjects: jest.fn(),
    },
    bucketName: 'documents',
}));

describe('Commande Globale Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { json: jest.fn() };
        next = jest.fn();
    });

    describe('getCommandesGlobales', () => {
        it('should fetch and return commandes globales', async () => {
            const commandes = [{ statutGeneral: 'Enregistrée', save: jest.fn() }];
            const sort = jest.fn().mockResolvedValue(commandes);
            const populate2 = jest.fn().mockReturnValue({ sort });
            const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
            CommandeGlobale.find.mockReturnValue({ populate: populate1 });
            req = { user: { role: 'Manager' } };

            await getCommandesGlobales(req, res, next);

            expect(CommandeGlobale.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(commandes);
        });
    });

    describe('deleteCommandeGlobale', () => {
        it('should delete a commande globale and associated data', async () => {
            const mockCommande = {
                informationsExpedition: { bonLivraisonUrl: 'http://docs/bl.pdf' },
                informationsReception: { bonLivraisonEmargeUrl: 'http://docs/br.pdf' },
                nonConformitesReception: [{ photosUrl: ['http://docs/nc1.jpg'] }],
                _id: 'childCommandeId'
            };
            const commandeGlobale = {
                _id: 'globalId',
                commandesFournisseurs: [mockCommande],
            };
            const populate = jest.fn().mockResolvedValue(commandeGlobale);
            CommandeGlobale.findById.mockReturnValue({ populate });
            Commande.deleteMany.mockResolvedValue({});
            CommandeGlobale.findByIdAndDelete.mockResolvedValue({});

            req = { params: { id: 'globalId' } };

            await deleteCommandeGlobale(req, res, next);

            expect(minioClient.removeObjects).toHaveBeenCalled();
            expect(Commande.deleteMany).toHaveBeenCalledWith({ _id: { $in: ['childCommandeId'] } });
            expect(CommandeGlobale.findByIdAndDelete).toHaveBeenCalledWith('globalId');
            expect(res.json).toHaveBeenCalledWith({ message: 'Commande globale et toutes les données associées ont été supprimées.' });
        });

        it('should throw NotFoundError if commande globale is not found', async () => {
            CommandeGlobale.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            req = { params: { id: 'nonExistentId' } };

            await deleteCommandeGlobale(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });
});

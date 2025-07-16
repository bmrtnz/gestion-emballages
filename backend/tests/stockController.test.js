// backend/tests/stockController.test.js
const { submitStock } = require('../controllers/stockController');
const StockStation = require('../models/stockStationModel');
const StockFournisseur = require('../models/stockFournisseurModel');
const Fournisseur = require('../models/fournisseurModel');
const { BadRequestError, ForbiddenError } = require('../utils/appError');

jest.mock('../models/stockStationModel');
jest.mock('../models/stockFournisseurModel');
jest.mock('../models/fournisseurModel');

describe('Stock Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('submitStock for Station', () => {
        it('should submit stock for a station', async () => {
            const stockData = { dateInventaire: new Date(), stocks: [{ articleId: 'a1', quantite: 10 }] };
            req = { body: stockData, user: { role: 'Station', entiteId: 'station1', _id: 'user1' } };
            StockStation.insertMany.mockResolvedValue({});

            await submitStock(req, res, next);

            expect(StockStation.insertMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Stock de la station enregistré avec succès.' });
        });

        it('should throw BadRequestError if data is invalid', async () => {
            req = { body: { dateInventaire: null, stocks: [] }, user: { role: 'Station' } };
            await submitStock(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });

    describe('submitStock for Fournisseur', () => {
        it('should submit stock for a fournisseur', async () => {
            const stockData = { dateInventaire: new Date(), stocks: [{ articleId: 'a1', quantite: 10 }], siteId: 'site1' };
            const mockFournisseur = { sites: [{ _id: 'site1' }] };
            Fournisseur.findById.mockResolvedValue(mockFournisseur);
            StockFournisseur.insertMany.mockResolvedValue({});
            req = { body: stockData, user: { role: 'Fournisseur', entiteId: 'f1', _id: 'user1' } };

            await submitStock(req, res, next);

            expect(Fournisseur.findById).toHaveBeenCalledWith('f1');
            expect(StockFournisseur.insertMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should throw ForbiddenError if site does not belong to fournisseur', async () => {
            const stockData = { dateInventaire: new Date(), stocks: [{}], siteId: 'wrongSite' };
            const mockFournisseur = { sites: [{ _id: 'site1' }] };
            Fournisseur.findById.mockResolvedValue(mockFournisseur);
            req = { body: stockData, user: { role: 'Fournisseur', entiteId: 'f1' } };

            await submitStock(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
        });
    });
});

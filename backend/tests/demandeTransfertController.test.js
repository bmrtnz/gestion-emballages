// backend/tests/demandeTransfertController.test.js
const { createDemandeTransfert, updateDemandeTransfertStatut } = require('../controllers/demandeTransfertController');
const DemandeTransfert = require('../models/demandeTransfertModel');
const demandeTransfertService = require('../services/demandeTransfertService');
const { BadRequestError } = require('../utils/appError');
const mongoose = require('mongoose');

jest.mock('../models/demandeTransfertModel');
jest.mock('../services/demandeTransfertService');

describe('Demande Transfert Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('createDemandeTransfert', () => {
        it('should create a demande de transfert', async () => {
            const demandeData = { stationSourceId: 'sourceId', articles: [] };
            const createdDemande = { _id: 'demandeId' };
            DemandeTransfert.create.mockResolvedValue(createdDemande);
            req = { body: demandeData, user: { _id: 'userId', entiteId: 'destId' } };

            await createDemandeTransfert(req, res, next);

            expect(DemandeTransfert.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdDemande);
        });

        it('should call next with BadRequestError if user has no station', async () => {
            req = { body: {}, user: { entiteId: null } };
            await createDemandeTransfert(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });

    describe('updateDemandeTransfertStatut', () => {
        it('should call the service and return the updated demande', async () => {
            const updatedDemande = { _id: 'demandeId', statut: 'Confirmée' };
            demandeTransfertService.updateStatusDemandeTransfert.mockResolvedValue(updatedDemande);
            req = { params: { id: 'demandeId' }, body: { statut: 'Confirmée' }, user: {} };

            await updateDemandeTransfertStatut(req, res, next);

            expect(demandeTransfertService.updateStatusDemandeTransfert).toHaveBeenCalledWith('demandeId', 'Confirmée', {}, req.body);
            expect(res.json).toHaveBeenCalledWith(updatedDemande);
        });
    });
});

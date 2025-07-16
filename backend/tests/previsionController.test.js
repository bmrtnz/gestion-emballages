// backend/tests/previsionController.test.js
const { createPrevision, updatePrevision } = require('../controllers/previsionController');
const Prevision = require('../models/previsionModel');
const { NotFoundError } = require('../utils/appError');

jest.mock('../models/previsionModel');

describe('Prevision Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('createPrevision', () => {
        it('should create a new prevision with weekly entries', async () => {
            const previsionData = { campagne: '25-26', fournisseurId: 'f1', articleId: 'a1', nom: 'Prev 1' };
            const createdPrevision = { _id: 'p1' };
            Prevision.create.mockResolvedValue(createdPrevision);
            req = { body: previsionData, user: { _id: 'userId' } };

            await createPrevision(req, res, next);

            expect(Prevision.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdPrevision);
        });
    });

    describe('updatePrevision', () => {
        it('should update prevision quantities', async () => {
            const mockPrevision = {
                previsionsHebdomadaires: [{ annee: 2025, numeroSemaine: 30, quantitePrevue: 100 }],
                save: jest.fn(),
            };
            mockPrevision.save.mockResolvedValue(mockPrevision); // Correct: save resolves to the document itself
            Prevision.findById.mockResolvedValue(mockPrevision);
            const updates = [{ annee: 2025, numeroSemaine: 30, quantitePrevue: 150 }];
            req = { params: { id: 'p1' }, body: { updates } };

            await updatePrevision(req, res, next);

            expect(mockPrevision.previsionsHebdomadaires[0].quantitePrevue).toBe(150);
            expect(mockPrevision.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockPrevision);
        });

        it('should throw NotFoundError if prevision not found', async () => {
            Prevision.findById.mockResolvedValue(null);
            req = { params: { id: 'nonExistentId' }, body: { updates: [] } };

            await updatePrevision(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });
});

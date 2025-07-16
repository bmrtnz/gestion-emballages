// backend/tests/fournisseurController.test.js
const {
    createFournisseur,
    getFournisseurs,
    updateFournisseur,
    deactivateFournisseur,
    addSiteToFournisseur,
    deleteSiteFromFournisseur,
    updateSiteInFournisseur,
} = require('../controllers/fournisseurController');
const Fournisseur = require('../models/fournisseurModel');
const { NotFoundError, BadRequestError } = require('../utils/appError');

jest.mock('../models/fournisseurModel');

describe('Fournisseur Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('createFournisseur', () => {
        it('should create and return a fournisseur', async () => {
            const newFournisseur = { nom: 'Test Fournisseur' };
            Fournisseur.create.mockResolvedValue(newFournisseur);
            req = { body: newFournisseur };

            await createFournisseur(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newFournisseur);
        });
    });

    describe('getFournisseurs', () => {
        it('should return all active fournisseurs', async () => {
            const fournisseurs = [{ nom: 'F1' }];
            const sort = jest.fn().mockResolvedValue(fournisseurs);
            Fournisseur.find.mockReturnValue({ sort });

            await getFournisseurs(req, res, next);

            expect(Fournisseur.find).toHaveBeenCalledWith({ isActive: true });
            expect(res.json).toHaveBeenCalledWith(fournisseurs);
        });
    });

    describe('updateFournisseur', () => {
        it('should update and return the fournisseur', async () => {
            const updatedFournisseur = { nom: 'Updated' };
            Fournisseur.findByIdAndUpdate.mockResolvedValue(updatedFournisseur);
            req = { params: { id: 'someId' }, body: { nom: 'Updated' } };

            await updateFournisseur(req, res, next);

            expect(res.json).toHaveBeenCalledWith(updatedFournisseur);
        });

        it('should call next with NotFoundError if fournisseur not found', async () => {
            Fournisseur.findByIdAndUpdate.mockResolvedValue(null);
            req = { params: { id: 'nonExistentId' }, body: {} };

            await updateFournisseur(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe('deactivateFournisseur', () => {
        it('should deactivate a fournisseur', async () => {
            const mockFournisseur = { isActive: true, save: jest.fn() };
            mockFournisseur.save.mockResolvedValue(mockFournisseur);
            Fournisseur.findById.mockResolvedValue(mockFournisseur);
            req = { params: { id: 'someId' } };

            await deactivateFournisseur(req, res, next);

            expect(mockFournisseur.isActive).toBe(false);
            expect(mockFournisseur.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Fournisseur désactivé avec succès' });
        });
    });

    describe('addSiteToFournisseur', () => {
        it('should add a site to a fournisseur', async () => {
            const mockFournisseur = { sites: [], save: jest.fn() };
            mockFournisseur.save.mockResolvedValue(mockFournisseur);
            mockFournisseur.sites.push = jest.fn();
            Fournisseur.findById.mockResolvedValue(mockFournisseur);
            req = { params: { id: 'someId' }, body: { nomSite: 'New Site' } };

            await addSiteToFournisseur(req, res, next);

            expect(mockFournisseur.sites.push).toHaveBeenCalled();
            expect(mockFournisseur.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockFournisseur);
        });
    });

    describe('deleteSiteFromFournisseur', () => {
        it('should delete a site from a fournisseur', async () => {
            const mockFournisseur = {
                sites: [{ _id: 'site1' }, { _id: 'site2' }],
                save: jest.fn(),
            };
            mockFournisseur.save.mockResolvedValue(mockFournisseur);
            mockFournisseur.sites.pull = jest.fn();
            Fournisseur.findById.mockResolvedValue(mockFournisseur);
            req = { params: { id: 'someId', siteId: 'site1' } };

            await deleteSiteFromFournisseur(req, res, next);

            expect(mockFournisseur.sites.pull).toHaveBeenCalledWith({ _id: 'site1' });
            expect(mockFournisseur.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Site supprimé avec succès' });
        });

        it('should throw BadRequestError if trying to delete the last site', async () => {
            const mockFournisseur = { sites: [{ _id: 'site1' }] };
            Fournisseur.findById.mockResolvedValue(mockFournisseur);
            req = { params: { id: 'someId', siteId: 'site1' } };

            await deleteSiteFromFournisseur(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });
});

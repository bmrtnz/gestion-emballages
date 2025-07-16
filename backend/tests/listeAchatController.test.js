// backend/tests/listeAchatController.test.js
const {
    getOrCreateListeAchat,
    updateItemInListeAchat,
    validateListeAchat,
    removeItemFromListeAchat,
} = require('../controllers/listeAchatController');
const ListeAchat = require('../models/listeAchatModel');
const Commande = require('../models/commandeModel');
const CommandeGlobale = require('../models/commandeGlobaleModel');
const { BadRequestError, NotFoundError } = require('../utils/appError');

jest.mock('../models/listeAchatModel');
jest.mock('../models/commandeModel');
jest.mock('../models/commandeGlobaleModel');

describe('Liste Achat Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('getOrCreateListeAchat', () => {
        it('should return an existing draft list', async () => {
            const existingList = { _id: 'listId' };
            ListeAchat.findOne.mockResolvedValue(existingList);
            req = { user: { entiteId: 'stationId' } };

            await getOrCreateListeAchat(req, res, next);

            expect(res.json).toHaveBeenCalledWith(existingList);
        });

        it('should create a new list if none exists', async () => {
            const newList = { _id: 'newListId' };
            ListeAchat.findOne.mockResolvedValue(null);
            ListeAchat.create.mockResolvedValue(newList);
            req = { user: { entiteId: 'stationId', _id: 'userId' } };

            await getOrCreateListeAchat(req, res, next);

            expect(ListeAchat.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(newList);
        });
    });

    describe('updateItemInListeAchat', () => {
        it('should add an item to the draft list', async () => {
            const mockList = { articles: [], save: jest.fn().mockResolvedValue(true) };
            mockList.articles.push = jest.fn();
            ListeAchat.findOne.mockResolvedValue(mockList);
            req = { user: { entiteId: 'stationId' }, body: { articleId: 'art1' } };

            await updateItemInListeAchat(req, res, next);

            expect(mockList.articles.push).toHaveBeenCalledWith({ articleId: 'art1' });
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('validateListeAchat', () => {
        it('should throw BadRequestError if list is empty', async () => {
            const emptyList = { articles: [] };
            const populate = jest.fn().mockResolvedValue(emptyList);
            ListeAchat.findOne.mockReturnValue({ populate });
            req = { user: { entiteId: 'stationId' } };

            await validateListeAchat(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });

    describe('removeItemFromListeAchat', () => {
        it('should remove an item from the list', async () => {
            const updatedList = { _id: 'listId' };
            ListeAchat.findOneAndUpdate.mockResolvedValue(updatedList);
            req = { user: { entiteId: 'stationId' }, params: { itemId: 'item1' } };

            await removeItemFromListeAchat(req, res, next);

            expect(ListeAchat.findOneAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(updatedList);
        });
    });
});

// backend/tests/stationController.test.js
const { createStation, getStations, updateStation, deleteStation } = require('../controllers/stationController');
const Station = require('../models/stationModel');
const { NotFoundError } = require('../utils/appError');

jest.mock('../models/stationModel');

describe('Station Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('createStation', () => {
        it('should create and return a station', async () => {
            const newStation = { nom: 'S1' };
            Station.create.mockResolvedValue(newStation);
            req = { body: newStation };

            await createStation(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newStation);
        });
    });

    describe('getStations', () => {
        it('should return all active stations', async () => {
            const stations = [{ nom: 'S1' }];
            Station.find.mockResolvedValue(stations);

            await getStations(req, res, next);

            expect(Station.find).toHaveBeenCalledWith({ isActive: true });
            expect(res.json).toHaveBeenCalledWith(stations);
        });
    });

    describe('updateStation', () => {
        it('should update and return the station', async () => {
            const updatedStation = { nom: 'S1 Updated' };
            Station.findByIdAndUpdate.mockResolvedValue(updatedStation);
            req = { params: { id: 's1' }, body: { nom: 'S1 Updated' } };

            await updateStation(req, res, next);

            expect(res.json).toHaveBeenCalledWith(updatedStation);
        });

        it('should call next with NotFoundError if station not found', async () => {
            Station.findByIdAndUpdate.mockResolvedValue(null);
            req = { params: { id: 'nonExistentId' }, body: {} };

            await updateStation(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe('deleteStation', () => {
        it('should deactivate a station', async () => {
            Station.findByIdAndUpdate.mockResolvedValue({ _id: 's1' });
            req = { params: { id: 's1' } };

            await deleteStation(req, res, next);

            expect(Station.findByIdAndUpdate).toHaveBeenCalledWith('s1', { isActive: false });
            expect(res.json).toHaveBeenCalledWith({ message: 'Station désactivée avec succès' });
        });
    });
});

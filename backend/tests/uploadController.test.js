// backend/tests/uploadController.test.js
const { uploadFile } = require('../controllers/uploadController');
const { minioClient, bucketName } = require('../config/minioClient');
const config = require('../config/env');
const { BadRequestError } = require('../utils/appError');

jest.mock('../config/minioClient', () => ({
    minioClient: {
        putObject: jest.fn(),
    },
    bucketName: 'test-bucket',
}));
jest.mock('../config/env', () => ({
    minio: {
        useSSL: false,
        externalHost: 'localhost',
        port: 9000,
    }
}));

describe('Upload Controller', () => {
    let req, res, next;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        minioClient.putObject.mockClear();
    });

    it('should upload a file and return its URL and key', async () => {
        req = {
            file: {
                originalname: 'test.jpg',
                buffer: Buffer.from('test'),
                size: 4,
            },
        };
        minioClient.putObject.mockResolvedValue({});

        await uploadFile(req, res, next);

        expect(minioClient.putObject).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Fichier uploadé avec succès',
            fileUrl: expect.any(String),
            fileKey: expect.any(String),
        }));
    });

    it('should call next with BadRequestError if no file is provided', async () => {
        req = { file: null };

        await uploadFile(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
});

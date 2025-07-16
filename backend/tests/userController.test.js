// backend/tests/userController.test.js
const { 
    createUser,
    loginUser,
    getUserProfile,
    getUsers,
    updateUser,
    deactivateUser 
} = require("../controllers/userController");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { BadRequestError, UnauthorizedError, ValidationError, NotFoundError } = require("../utils/appError");

// Mock the dependencies
jest.mock("../models/userModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../config/env");

describe("User Controller", () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { id: "userId" },
            body: {
                email: "test@example.com",
                password: "password123",
                role: "Station",
                nomComplet: "Test User",
                entiteId: "entiteId123"
            },
            user: {
                _id: "userId",
                email: "test@example.com",
                nomComplet: "Test User",
                role: "Station"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        
        // Default mocks
        config.jwtSecret = "test-secret";
    });

    describe("createUser", () => {
        it("should create a user and return it with status 201", async () => {
            const newUser = {
                _id: "newUserId",
                email: "test@example.com",
                role: "Station",
                nomComplet: "Test User",
                entiteId: "entiteId123",
                createdAt: new Date()
            };

            User.findOne.mockResolvedValue(null); // No existing user
            User.create.mockResolvedValue(newUser);

            await createUser(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
            expect(User.create).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
                role: "Station",
                nomComplet: "Test User",
                entiteId: "entiteId123"
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                _id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                nomComplet: newUser.nomComplet,
                entiteId: newUser.entiteId,
                createdAt: newUser.createdAt,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if email is missing", async () => {
            req.body.email = undefined;

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if password is missing", async () => {
            req.body.password = undefined;

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if role is missing", async () => {
            req.body.role = undefined;

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if nomComplet is missing", async () => {
            req.body.nomComplet = undefined;

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if email is invalid", async () => {
            req.body.email = "invalid-email";

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if password is too short", async () => {
            req.body.password = "12345";

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if role is invalid", async () => {
            req.body.role = "InvalidRole";

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with BadRequestError if user already exists", async () => {
            const existingUser = { email: "test@example.com" };
            User.findOne.mockResolvedValue(existingUser);

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("loginUser", () => {
        it("should login user and return user data with token", async () => {
            const user = {
                _id: "userId",
                email: "test@example.com",
                nomComplet: "Test User",
                role: "Station",
                entiteId: "entiteId123",
                password: "hashedPassword",
                isActive: true
            };
            const token = "jwt-token";

            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue(token);

            req.body = { email: "test@example.com", password: "password123" };

            await loginUser(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
            expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: user._id, role: user.role, entiteId: user.entiteId },
                config.jwtSecret,
                { expiresIn: '1d' }
            );
            expect(res.json).toHaveBeenCalledWith({
                _id: user._id,
                nomComplet: user.nomComplet,
                email: user.email,
                role: user.role,
                entiteId: user.entiteId,
                token: token,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if email is missing", async () => {
            req.body = { password: "password123" };

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if password is missing", async () => {
            req.body = { email: "test@example.com" };

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with UnauthorizedError if user is inactive", async () => {
            const user = { email: "test@example.com", isActive: false };
            User.findOne.mockResolvedValue(user);

            req.body = { email: "test@example.com", password: "password123" };

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with UnauthorizedError if password is incorrect", async () => {
            const user = { email: "test@example.com", password: "hashedPassword", isActive: true };
            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(false);

            req.body = { email: "test@example.com", password: "wrongPassword" };

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with UnauthorizedError if user does not exist", async () => {
            User.findOne.mockResolvedValue(null);

            req.body = { email: "nonexistent@example.com", password: "password123" };

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("getUserProfile", () => {
        it("should return user profile from req.user", async () => {
            await getUserProfile(req, res, next);

            expect(res.json).toHaveBeenCalledWith(req.user);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("getUsers", () => {
        it("should fetch all active users and return them", async () => {
            const users = [
                { _id: "1", email: "user1@example.com", nomComplet: "User 1", isActive: true },
                { _id: "2", email: "user2@example.com", nomComplet: "User 2", isActive: true }
            ];
            const selectMock = jest.fn().mockResolvedValue(users);
            User.find.mockReturnValue({ select: selectMock });

            await getUsers(req, res, next);

            expect(User.find).toHaveBeenCalledWith({ isActive: true });
            expect(selectMock).toHaveBeenCalledWith('-password');
            expect(res.json).toHaveBeenCalledWith(users);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("updateUser", () => {
        it("should update user and return updated data", async () => {
            const user = {
                _id: "userId",
                nomComplet: "Old Name",
                telephone: "123456789",
                entiteId: "oldEntiteId",
                save: jest.fn().mockResolvedValue()
            };
            const updatedUser = {
                _id: "userId",
                nomComplet: "Updated Name",
                telephone: "987654321",
                entiteId: "newEntiteId"
            };
            const selectMock = jest.fn().mockResolvedValue(updatedUser);

            User.findById
                .mockResolvedValueOnce(user)
                .mockReturnValueOnce({ select: selectMock });

            req.body = {
                nomComplet: "Updated Name",
                telephone: "987654321",
                entiteId: "newEntiteId"
            };

            await updateUser(req, res, next);

            expect(User.findById).toHaveBeenCalledWith("userId");
            expect(user.nomComplet).toBe("Updated Name");
            expect(user.telephone).toBe("987654321");
            expect(user.entiteId).toBe("newEntiteId");
            expect(user.save).toHaveBeenCalled();
            expect(selectMock).toHaveBeenCalledWith('-password');
            expect(res.json).toHaveBeenCalledWith(updatedUser);
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if user not found", async () => {
            User.findById.mockResolvedValue(null);

            await updateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("deactivateUser", () => {
        it("should deactivate user and return success message", async () => {
            const user = {
                _id: "userId",
                isActive: true,
                save: jest.fn().mockResolvedValue()
            };

            User.findById.mockResolvedValue(user);

            await deactivateUser(req, res, next);

            expect(User.findById).toHaveBeenCalledWith("userId");
            expect(user.isActive).toBe(false);
            expect(user.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur désactivé avec succès' });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if user not found", async () => {
            User.findById.mockResolvedValue(null);

            await deactivateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
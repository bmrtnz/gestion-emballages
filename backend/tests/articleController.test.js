// backend/tests/articleController.test.js
const {
    createArticle,
    getArticles,
    addOrUpdateFournisseurForArticle,
    removeFournisseurFromArticle,
    updateFournisseurForArticle,
} = require("../controllers/articleController");
const Article = require("../models/articleModel");
const Fournisseur = require("../models/fournisseurModel");
const { NotFoundError, ValidationError } = require("../utils/appError");

// Mock the models
jest.mock("../models/articleModel");
jest.mock("../models/fournisseurModel");

describe("Article Controller", () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { id: "articleId" },
            body: {
                fournisseurId: "fId",
                prixUnitaire: 42,
                referenceFournisseur: "REF123",
                uniteConditionnement: "box",
                quantiteParConditionnement: 10,
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe("createArticle", () => {
        it("should create an article and return it with status 201", async () => {
            const newArticleData = {
                codeArticle: "ART001",
                designation: "Test Article",
                categorie: "Test",
            };
            const createdArticle = { _id: "newId", ...newArticleData };
            req.body = newArticleData;
            Article.create.mockResolvedValue(createdArticle);

            await createArticle(req, res, next);

            expect(Article.create).toHaveBeenCalledWith(newArticleData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdArticle);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("getArticles", () => {
        it("should fetch all active articles and return them", async () => {
            const articles = [
                { _id: "1", codeArticle: "ART001", isActive: true },
                { _id: "2", codeArticle: "ART002", isActive: true }
            ];
            Article.find.mockResolvedValue(articles);

            await getArticles(req, res, next);

            expect(Article.find).toHaveBeenCalledWith({ isActive: true });
            expect(res.json).toHaveBeenCalledWith(articles);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("addOrUpdateFournisseurForArticle", () => {
        it("should call next with ValidationError if fournisseurId is missing", async () => {
            req.body.fournisseurId = undefined;

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with ValidationError if prixUnitaire is missing", async () => {
            req.body.prixUnitaire = undefined;

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if fournisseur does not exist", async () => {
            Fournisseur.findById.mockResolvedValue(null);

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(Fournisseur.findById).toHaveBeenCalledWith("fId");
            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if fournisseur is inactive", async () => {
            Fournisseur.findById.mockResolvedValue({ isActive: false });

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if article does not exist", async () => {
            Fournisseur.findById.mockResolvedValue({ isActive: true });
            Article.findById.mockResolvedValue(null);

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(Article.findById).toHaveBeenCalledWith("articleId");
            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should add a new fournisseur if not already present", async () => {
            const article = {
                _id: "articleId",
                fournisseurs: [],
                save: jest.fn().mockResolvedValue(),
            };
            const updatedArticle = {
                _id: "articleId",
                fournisseurs: [req.body],
            };

            Fournisseur.findById.mockResolvedValue({ isActive: true });
            Article.findById
                .mockResolvedValueOnce(article)
                .mockResolvedValueOnce(updatedArticle);

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(article.fournisseurs).toHaveLength(1);
            expect(article.fournisseurs[0]).toMatchObject(req.body);
            expect(article.save).toHaveBeenCalled();
            expect(Article.findById).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(updatedArticle);
            expect(next).not.toHaveBeenCalled();
        });

        it("should update an existing fournisseur", async () => {
            const existingFournisseur = {
                fournisseurId: { toString: () => "fId" },
                prixUnitaire: 10,
                referenceFournisseur: "OLD_REF",
                uniteConditionnement: "oldUnit",
                quantiteParConditionnement: 5,
            };
            const article = {
                _id: "articleId",
                fournisseurs: [existingFournisseur],
                save: jest.fn().mockResolvedValue(),
            };
            const updatedArticle = {
                _id: "articleId",
                fournisseurs: [{
                    fournisseurId: { toString: () => "fId" },
                    prixUnitaire: 42,
                    referenceFournisseur: "REF123",
                    uniteConditionnement: "box",
                    quantiteParConditionnement: 10,
                }],
            };

            Fournisseur.findById.mockResolvedValue({ isActive: true });
            Article.findById
                .mockResolvedValueOnce(article)
                .mockResolvedValueOnce(updatedArticle);

            await addOrUpdateFournisseurForArticle(req, res, next);

            expect(existingFournisseur.prixUnitaire).toBe(42);
            expect(existingFournisseur.referenceFournisseur).toBe("REF123");
            expect(existingFournisseur.uniteConditionnement).toBe("box");
            expect(existingFournisseur.quantiteParConditionnement).toBe(10);
            expect(article.save).toHaveBeenCalled();
            expect(Article.findById).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(updatedArticle);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("removeFournisseurFromArticle", () => {
        it("should remove a fournisseur and return the updated article", async () => {
            const articleId = "mockArticleId";
            const fournisseurInfoId = "mockFournisseurInfoId";
            const updatedArticle = { 
                _id: articleId, 
                fournisseurs: [] 
            };

            Article.findByIdAndUpdate.mockResolvedValue(updatedArticle);
            req.params = { id: articleId, fournisseurInfoId };

            await removeFournisseurFromArticle(req, res, next);

            expect(Article.findByIdAndUpdate).toHaveBeenCalledWith(
                articleId,
                { $pull: { fournisseurs: { _id: fournisseurInfoId } } },
                { new: true }
            );
            expect(res.json).toHaveBeenCalledWith(updatedArticle);
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if article not found", async () => {
            const articleId = "nonExistentId";
            const fournisseurInfoId = "mockFournisseurInfoId";

            Article.findByIdAndUpdate.mockResolvedValue(null);
            req.params = { id: articleId, fournisseurInfoId };

            await removeFournisseurFromArticle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("updateFournisseurForArticle", () => {
        it("should update all provided fournisseur fields", async () => {
            const articleId = "mockArticleId";
            const fournisseurInfoId = "mockFournisseurInfoId";
            const updateData = {
                prixUnitaire: 25,
                referenceFournisseur: "NEW_REF",
                uniteConditionnement: "newUnit",
                quantiteParConditionnement: 15
            };
            
            const mockFournisseurInfo = {
                _id: fournisseurInfoId,
                prixUnitaire: 10,
                referenceFournisseur: "OLD_REF",
                uniteConditionnement: "oldUnit",
                quantiteParConditionnement: 5,
            };

            const article = {
                _id: articleId,
                fournisseurs: {
                    id: jest.fn().mockReturnValue(mockFournisseurInfo),
                },
                save: jest.fn().mockResolvedValue(),
            };

            const updatedArticle = {
                _id: articleId,
                fournisseurs: [{
                    ...mockFournisseurInfo,
                    ...updateData
                }],
            };

            Article.findById
                .mockResolvedValueOnce(article)
                .mockResolvedValueOnce(updatedArticle);
            
            req.params = { id: articleId, fournisseurInfoId };
            req.body = updateData;

            await updateFournisseurForArticle(req, res, next);

            expect(Article.findById).toHaveBeenCalledWith(articleId);
            expect(article.fournisseurs.id).toHaveBeenCalledWith(fournisseurInfoId);
            expect(mockFournisseurInfo.prixUnitaire).toBe(25);
            expect(mockFournisseurInfo.referenceFournisseur).toBe("NEW_REF");
            expect(mockFournisseurInfo.uniteConditionnement).toBe("newUnit");
            expect(mockFournisseurInfo.quantiteParConditionnement).toBe(15);
            expect(article.save).toHaveBeenCalled();
            expect(Article.findById).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(updatedArticle);
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if article not found", async () => {
            const articleId = "nonExistentId";
            const fournisseurInfoId = "mockFournisseurInfoId";

            Article.findById.mockResolvedValue(null);
            req.params = { id: articleId, fournisseurInfoId };
            req.body = { prixUnitaire: 20 };

            await updateFournisseurForArticle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with NotFoundError if fournisseur info not found", async () => {
            const articleId = "mockArticleId";
            const fournisseurInfoId = "nonExistentFournisseurInfoId";

            const article = {
                _id: articleId,
                fournisseurs: {
                    id: jest.fn().mockReturnValue(null),
                },
            };

            Article.findById.mockResolvedValue(article);
            req.params = { id: articleId, fournisseurInfoId };
            req.body = { prixUnitaire: 20 };

            await updateFournisseurForArticle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
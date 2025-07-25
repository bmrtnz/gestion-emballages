// backend/models/stockFournisseurModel.js
const mongoose = require("mongoose");

// Schéma pour le stock d'un article (sans tracking de modifications)
const articleStockSchema = new mongoose.Schema(
    {
        articleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article",
            required: true,
        },
        quantiteStock: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

// Schéma pour le stock hebdomadaire (contient plusieurs articles)
const weeklyArticlesStockSchema = new mongoose.Schema(
    {
        numeroSemaine: {
            type: Number,
            required: true,
            min: 1,
            max: 52,
        },
        articles: [articleStockSchema],
    },
    { _id: false }
);

// Schéma principal pour le stock fournisseur
const stockFournisseurSchema = new mongoose.Schema(
    {
        campagne: {
            type: String,
            required: true,
            match: /^\d{2}-\d{2}$/, // Format: "25-26"
        },
        fournisseurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fournisseur",
            required: true,
        },
        siteId: {
            // Référence à l'ID du site dans le document Fournisseur
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        weeklyStocks: [weeklyArticlesStockSchema],
    },
    { timestamps: true }
);

// Index composé pour garantir l'unicité du stock par fournisseur/site/campagne
stockFournisseurSchema.index({ fournisseurId: 1, siteId: 1, campagne: 1 }, { unique: true });

// Index pour améliorer les performances de recherche
stockFournisseurSchema.index({ "weeklyStocks.numeroSemaine": 1 });
stockFournisseurSchema.index({ "weeklyStocks.articles.articleId": 1 });

// Méthode pour obtenir ou créer une semaine
stockFournisseurSchema.methods.getOrCreateWeek = function (numeroSemaine) {
    let weekStock = this.weeklyStocks.find(w => w.numeroSemaine === numeroSemaine);
    
    if (!weekStock) {
        weekStock = {
            numeroSemaine,
            articles: []
        };
        this.weeklyStocks.push(weekStock);
        // Trier les semaines par numéro
        this.weeklyStocks.sort((a, b) => a.numeroSemaine - b.numeroSemaine);
        // Mark as modified since we added a new week
        this.markModified('weeklyStocks');
    }
    
    return weekStock;
};

// Méthode pour mettre à jour le stock d'un article pour une semaine donnée
stockFournisseurSchema.methods.updateArticleWeeklyStock = function (numeroSemaine, articleId, quantiteStock) {
    const weekStock = this.getOrCreateWeek(numeroSemaine);
    const articleIndex = weekStock.articles.findIndex(a => a.articleId.toString() === articleId.toString());
    
    if (articleIndex > -1) {
        // Mettre à jour la quantité existante
        weekStock.articles[articleIndex].quantiteStock = quantiteStock;
    } else {
        // Ajouter un nouvel article
        weekStock.articles.push({
            articleId,
            quantiteStock
        });
    }
    
    // Mark the nested array as modified to ensure Mongoose saves it
    this.markModified('weeklyStocks');
    
    return this.save();
};

// Méthode pour mettre à jour plusieurs articles d'une semaine en une fois
stockFournisseurSchema.methods.updateWeeklyStocks = async function (numeroSemaine, articlesData) {
    try {
        const weekStock = this.getOrCreateWeek(numeroSemaine);
        
        // Remplacer tous les articles de la semaine
        weekStock.articles = articlesData.map(article => ({
            articleId: article.articleId,
            quantiteStock: article.quantiteStock || 0
        }));
        
        // Mark the nested array as modified to ensure Mongoose saves it
        this.markModified('weeklyStocks');
        
        // Log for debugging
        console.log(`[StockFournisseur] Updating week ${numeroSemaine} with ${articlesData.length} articles`);
        console.log(`[StockFournisseur] Document _id: ${this._id}, isNew: ${this.isNew}`);
        
        const savedDoc = await this.save();
        
        console.log(`[StockFournisseur] Save completed. Weekly stocks count: ${savedDoc.weeklyStocks.length}`);
        
        return savedDoc;
    } catch (error) {
        console.error('[StockFournisseur] Error in updateWeeklyStocks:', error);
        throw error;
    }
};

// Méthode pour obtenir le stock d'une semaine spécifique
stockFournisseurSchema.methods.getWeeklyStock = function (numeroSemaine) {
    const weekStock = this.weeklyStocks.find(w => w.numeroSemaine === numeroSemaine);
    return weekStock ? weekStock.articles : [];
};

// Méthode pour obtenir le stock d'un article pour une semaine spécifique
stockFournisseurSchema.methods.getArticleStockForWeek = function (numeroSemaine, articleId) {
    const weekStock = this.weeklyStocks.find(w => w.numeroSemaine === numeroSemaine);
    if (!weekStock) return 0;
    
    const article = weekStock.articles.find(a => a.articleId.toString() === articleId.toString());
    return article ? article.quantiteStock : 0;
};

// Méthode pour obtenir l'historique complet d'un article à travers toutes les semaines
stockFournisseurSchema.methods.getArticleHistory = function (articleId) {
    const history = [];
    
    this.weeklyStocks.forEach(weekStock => {
        const article = weekStock.articles.find(a => a.articleId.toString() === articleId.toString());
        if (article) {
            history.push({
                numeroSemaine: weekStock.numeroSemaine,
                quantiteStock: article.quantiteStock
            });
        }
    });
    
    return history;
};

// Méthode pour obtenir le total du stock d'un article sur toute la campagne
stockFournisseurSchema.methods.getArticleTotalStock = function (articleId) {
    let total = 0;
    
    this.weeklyStocks.forEach(weekStock => {
        const article = weekStock.articles.find(a => a.articleId.toString() === articleId.toString());
        if (article) {
            total += article.quantiteStock;
        }
    });
    
    return total;
};

// Méthode pour obtenir les statistiques par trimestre
stockFournisseurSchema.methods.getQuarterlyStats = function () {
    const quarters = {
        Q3: { weeks: [27, 39], articles: new Map() },
        Q4: { weeks: [40, 52], articles: new Map() },
        Q1: { weeks: [1, 13], articles: new Map() },
        Q2: { weeks: [14, 26], articles: new Map() },
    };
    
    this.weeklyStocks.forEach(weekStock => {
        let quarter = null;
        
        if (weekStock.numeroSemaine >= 27 && weekStock.numeroSemaine <= 39) {
            quarter = quarters.Q3;
        } else if (weekStock.numeroSemaine >= 40 && weekStock.numeroSemaine <= 52) {
            quarter = quarters.Q4;
        } else if (weekStock.numeroSemaine >= 1 && weekStock.numeroSemaine <= 13) {
            quarter = quarters.Q1;
        } else if (weekStock.numeroSemaine >= 14 && weekStock.numeroSemaine <= 26) {
            quarter = quarters.Q2;
        }
        
        if (quarter) {
            weekStock.articles.forEach(article => {
                const articleIdStr = article.articleId.toString();
                const currentTotal = quarter.articles.get(articleIdStr) || 0;
                quarter.articles.set(articleIdStr, currentTotal + article.quantiteStock);
            });
        }
    });
    
    // Convertir les Maps en objets
    const result = {};
    Object.keys(quarters).forEach(q => {
        result[q] = {
            weeks: quarters[q].weeks,
            articleTotals: Object.fromEntries(quarters[q].articles)
        };
    });
    
    return result;
};

// Méthode pour obtenir toutes les semaines avec stock
stockFournisseurSchema.methods.getWeeksWithStock = function () {
    return this.weeklyStocks.map(w => w.numeroSemaine).sort((a, b) => a - b);
};

// Méthode pour obtenir tous les articles présents dans au moins une semaine
stockFournisseurSchema.methods.getAllArticles = function () {
    const articlesSet = new Set();
    
    this.weeklyStocks.forEach(weekStock => {
        weekStock.articles.forEach(article => {
            articlesSet.add(article.articleId.toString());
        });
    });
    
    return Array.from(articlesSet);
};

const StockFournisseur = mongoose.model("StockFournisseur", stockFournisseurSchema);
module.exports = StockFournisseur;
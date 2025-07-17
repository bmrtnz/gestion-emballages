const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les modèles
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Fournisseur = require("../models/fournisseurModel");
const Article = require("../models/articleModel");

// Charger les variables d'environnement
dotenv.config();

// Connexion à la DB
mongoose
    .connect(process.env.MONGO_URI_LOCAL)
    .then(() => console.log("MongoDB connecté pour vérification."))
    .catch((err) => console.error(err));

const verifyData = async () => {
    try {
        // Compter les documents
        const userCount = await User.countDocuments();
        const stationCount = await Station.countDocuments();
        const fournisseurCount = await Fournisseur.countDocuments();
        const articleCount = await Article.countDocuments();
        const activeArticleCount = await Article.countDocuments({ isActive: true });

        console.log("\n=== STATISTIQUES DE LA BASE DE DONNÉES ===");
        console.log(`Utilisateurs: ${userCount}`);
        console.log(`Stations: ${stationCount}`);
        console.log(`Fournisseurs: ${fournisseurCount}`);
        console.log(`Articles: ${articleCount}`);
        console.log(`Articles actifs: ${activeArticleCount}`);
        console.log(`Articles inactifs: ${articleCount - activeArticleCount}`);

        // Statistiques par catégorie
        const categoryStats = await Article.aggregate([
            { $group: { _id: "$categorie", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log("\n=== RÉPARTITION PAR CATÉGORIE ===");
        categoryStats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} articles`);
        });

        // Statistiques des fournisseurs
        const supplierStats = await Article.aggregate([
            { $unwind: "$fournisseurs" },
            { $lookup: { from: "fournisseurs", localField: "fournisseurs.fournisseurId", foreignField: "_id", as: "supplier" } },
            { $unwind: "$supplier" },
            { $group: { _id: "$supplier.nom", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log("\n=== LIENS AVEC FOURNISSEURS ===");
        supplierStats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} liens`);
        });

        // Échantillon d'articles
        const sampleArticles = await Article.find()
            .populate('fournisseurs.fournisseurId', 'nom')
            .limit(5);

        console.log("\n=== ÉCHANTILLON D'ARTICLES ===");
        sampleArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.codeArticle} - ${article.designation}`);
            console.log(`   Catégorie: ${article.categorie}`);
            console.log(`   Fournisseurs: ${article.fournisseurs.map(f => f.fournisseurId.nom).join(', ')}`);
            console.log(`   Prix: ${article.fournisseurs.map(f => f.prixUnitaire + '€').join(', ')}`);
            console.log("");
        });

        process.exit();
    } catch (error) {
        console.error(`Erreur: ${error}`);
        process.exit(1);
    }
};

verifyData();
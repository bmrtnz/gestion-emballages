// backend/data/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les modèles
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Fournisseur = require("../models/fournisseurModel");
const Article = require("../models/articleModel");

// Charger les données initiales
const stations = require("./stations");
const fournisseurs = require("./suppliers.json");
const articles = require("./articles.json");

// Charger les variables d'environnement
dotenv.config();

// Connexion à la DB - use environment variable for connection string
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestionEmballages')
    .then(() => console.log("MongoDB connecté pour le seeder."))
    .catch((err) => console.error(err));

const importData = async () => {
    try {
        // 1. Nettoyer la base
        await User.deleteMany();
        await Station.deleteMany();
        await Fournisseur.deleteMany();
        await Article.deleteMany();

        // 2. Insérer les données indépendantes
        const createdStations = await Station.insertMany(stations);
        const createdFournisseurs = await Fournisseur.insertMany(fournisseurs);

        // 3. Créer les utilisateurs liés
        const usersToCreate = [
            {
                nomComplet: "Thomas Decoudun",
                email: "thomas.decoudun@blue-whale.com",
                password: "password123",
                role: "Manager",
            },
            {
                nomComplet: "Nicole Lang",
                email: "nicole.lang@blue-whale.com",
                password: "password123",
                role: "Gestionnaire",
            },
            {
                nomComplet: "Germain Vidil",
                email: "g.vidil@stanor.fr",
                password: "password123",
                role: "Station",
                entiteId: createdStations[0]._id,
            },
            {
                nomComplet: "Lucas Grard",
                email: "l.grard@3D.fr",
                password: "password123",
                role: "Station",
                entiteId: createdStations[1]._id,
            },
        ];
        
        // Ajouter un utilisateur pour chaque fournisseur
        for (let i = 0; i < createdFournisseurs.length; i++) {
            const supplier = createdFournisseurs[i];
            const contact = supplier.sites.find(site => site.estPrincipal)?.contact;
            
            if (contact) {
                usersToCreate.push({
                    nomComplet: contact.nom,
                    email: contact.email,
                    password: "password123",
                    role: "Fournisseur",
                    entiteId: supplier._id,
                });
            }
        }

        await User.create(usersToCreate);

        // 4. Traiter et insérer les articles
        console.log("Traitement des articles...");
        const processedArticles = articles.map(article => {
            const processedSuppliers = article.fournisseurs.map(supplier => {
                let realSupplierId;
                
                // Extraire l'index du fournisseur depuis l'ID placeholder
                const supplierMatch = supplier.fournisseurId.match(/SUPPLIER_(\d+)_ID/);
                if (supplierMatch) {
                    const supplierIndex = parseInt(supplierMatch[1]) - 1; // Convert to 0-based index
                    if (supplierIndex < createdFournisseurs.length) {
                        realSupplierId = createdFournisseurs[supplierIndex]._id;
                    } else {
                        realSupplierId = createdFournisseurs[0]._id; // Fallback
                    }
                } else {
                    realSupplierId = createdFournisseurs[0]._id; // Fallback
                }
                
                return {
                    ...supplier,
                    fournisseurId: realSupplierId
                };
            });
            
            return {
                ...article,
                fournisseurs: processedSuppliers
            };
        });

        // Import articles par batch pour de meilleures performances
        console.log("Importation des articles...");
        const batchSize = 100;
        for (let i = 0; i < processedArticles.length; i += batchSize) {
            const batch = processedArticles.slice(i, i + batchSize);
            await Article.insertMany(batch);
            console.log(`Importé ${Math.min(i + batchSize, processedArticles.length)} / ${processedArticles.length} articles`);
        }
        console.log("Articles importés avec succès !");

        console.log("Données importées avec succès !");
        process.exit();
    } catch (error) {
        console.error(`Erreur: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Station.deleteMany();
        await Fournisseur.deleteMany();
        await Article.deleteMany();

        console.log("Données détruites avec succès !");
        process.exit();
    } catch (error) {
        console.error(`Erreur: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === "-d") {
    destroyData();
} else {
    importData();
}

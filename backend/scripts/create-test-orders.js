// backend/scripts/create-test-orders.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load models
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Fournisseur = require("../models/fournisseurModel");
const Article = require("../models/articleModel");
const ListeAchat = require("../models/listeAchatModel");
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");

// Load environment variables
dotenv.config();

// Database connection
const mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/gestionEmballages';
console.log(`Connecting to MongoDB: ${mongoUri}`);

mongoose
    .connect(mongoUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => console.log("MongoDB connected for test order creation."))
    .catch((err) => console.error(err));

const createTestOrders = async () => {
    try {
        // Wait for database connection
        await mongoose.connection.asPromise();
        console.log("Database connected successfully");
        
        console.log("Creating test orders...");

        // Get first station and user
        const station = await Station.findOne();
        const stationUser = await User.findOne({ role: "Station", entiteId: station._id });
        
        if (!station || !stationUser) {
            console.log("No station or station user found. Run data:import first.");
            return;
        }

        // Get some articles with suppliers
        const articles = await Article.find({ fournisseurs: { $exists: true, $not: { $size: 0 } } }).limit(3);
        
        if (articles.length === 0) {
            console.log("No articles with suppliers found. Run data:import first.");
            return;
        }

        console.log(`Found station: ${station.nom}`);
        console.log(`Found ${articles.length} articles`);

        // Create a shopping list
        const listeAchat = await ListeAchat.create({
            stationId: station._id,
            creeParId: stationUser._id,
            articles: articles.map(article => {
                const supplier = article.fournisseurs[0]; // Take first supplier
                return {
                    articleId: article._id,
                    fournisseurId: supplier.fournisseurId,
                    quantite: Math.floor(Math.random() * 10) + 1,
                    dateSouhaiteeLivraison: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                };
            })
        });

        console.log("Created shopping list with articles");

        // Now simulate validation to create orders
        const populatedListeAchat = await ListeAchat.findById(listeAchat._id).populate("articles.articleId");

        // Group articles by supplier
        const commandesParFournisseur = new Map();
        for (const item of populatedListeAchat.articles) {
            const fournisseurId = item.fournisseurId.toString();
            if (!commandesParFournisseur.has(fournisseurId)) {
                commandesParFournisseur.set(fournisseurId, []);
            }
            commandesParFournisseur.get(fournisseurId).push(item);
        }

        let montantTotalGlobal = 0;
        const commandesCreesIds = [];

        // Create orders per supplier
        for (const [fournisseurId, items] of commandesParFournisseur.entries()) {
            let montantTotalCommande = 0;
            const articlesDeCommande = [];

            for (const item of items) {
                // Get frozen pricing from article
                const articleData = item.articleId.fournisseurs.find(
                    (f) => f.fournisseurId._id.toString() === fournisseurId
                );
                if (!articleData) {
                    console.log(`No supplier data found for article ${item.articleId.designation} and supplier ${fournisseurId}`);
                    continue;
                }

                const prix = articleData.prixUnitaire;
                const quantiteParConditionnement = articleData.quantiteParConditionnement || 1;
                // Calculate total like in listeAchatController: prix * quantite (where prix is already per conditioning unit)
                const lineTotal = prix * item.quantite;
                montantTotalCommande += lineTotal;
                

                articlesDeCommande.push({
                    articleId: item.articleId._id,
                    quantiteCommandee: item.quantite,
                    dateSouhaiteeLivraison: item.dateSouhaiteeLivraison,
                    prixUnitaire: prix,
                    uniteConditionnement: articleData.uniteConditionnement,
                    quantiteParConditionnement: quantiteParConditionnement,
                    referenceFournisseur: articleData.referenceFournisseur,
                });
            }

            // Create the Command document
            const nouvelleCommande = await Commande.create({
                numeroCommande: `CMD-${Date.now()}-${fournisseurId.slice(-4)}`,
                fournisseurId: fournisseurId,
                stationId: station._id,
                articles: articlesDeCommande,
                montantTotalHT: montantTotalCommande,
            });
            
            commandesCreesIds.push(nouvelleCommande._id);
            montantTotalGlobal += montantTotalCommande;
            
            console.log(`Created order ${nouvelleCommande.numeroCommande} with amount: €${montantTotalCommande.toFixed(2)}`);
        }

        // Create Global Command
        const commandeGlobale = await CommandeGlobale.create({
            referenceGlobale: `CG-${Date.now()}`,
            stationId: station._id,
            listeAchatId: listeAchat._id,
            commandesFournisseurs: commandesCreesIds,
            montantTotalHT: montantTotalGlobal,
            creeParId: stationUser._id,
        });

        // Link individual commands to global command
        await Commande.updateMany(
            { _id: { $in: commandesCreesIds } },
            { commandeGlobaleId: commandeGlobale._id }
        );

        // Mark shopping list as processed
        listeAchat.statut = "Traitée";
        listeAchat.commandeGlobaleId = commandeGlobale._id;
        await listeAchat.save();

        console.log(`Created global order ${commandeGlobale.referenceGlobale} with total amount: €${montantTotalGlobal.toFixed(2)}`);
        console.log("Test orders created successfully!");
        
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

createTestOrders();
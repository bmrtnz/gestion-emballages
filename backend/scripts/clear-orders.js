// backend/scripts/clear-orders.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load models
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");
const ListeAchat = require("../models/listeAchatModel");

// Load environment variables
dotenv.config();

// Database connection
const mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/gestionEmballages';

mongoose
    .connect(mongoUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => console.log("MongoDB connected for clearing orders."))
    .catch((err) => console.error(err));

const clearOrders = async () => {
    try {
        // Wait for database connection
        await mongoose.connection.asPromise();
        console.log("Database connected successfully");

        console.log("Clearing all orders and shopping lists...");

        // Count existing data
        const commandeCount = await Commande.countDocuments();
        const commandeGlobaleCount = await CommandeGlobale.countDocuments();
        const listeAchatCount = await ListeAchat.countDocuments();

        console.log(`Found ${commandeCount} commandes, ${commandeGlobaleCount} commandes globales, ${listeAchatCount} listes d'achat`);

        // Clear all orders
        await Commande.deleteMany({});
        await CommandeGlobale.deleteMany({});
        await ListeAchat.deleteMany({});

        console.log("✅ All orders and shopping lists cleared successfully!");
        
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

clearOrders();
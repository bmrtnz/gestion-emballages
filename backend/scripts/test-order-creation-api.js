// backend/scripts/test-order-creation-api.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Load models
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Article = require("../models/articleModel");
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
    .then(() => console.log("MongoDB connected for API test."))
    .catch((err) => console.error(err));

const testOrderCreationAPI = async () => {
    try {
        // Wait for database connection
        await mongoose.connection.asPromise();
        console.log("Database connected successfully");

        // Get first station and user
        const station = await Station.findOne();
        const stationUser = await User.findOne({ role: "Station", entiteId: station._id });
        
        if (!station || !stationUser) {
            console.log("No station or station user found. Run data:import first.");
            return;
        }

        // Get some articles with suppliers
        const articles = await Article.find({ 
            fournisseurs: { $exists: true, $not: { $size: 0 } },
            isActive: true 
        }).limit(2);
        
        if (articles.length === 0) {
            console.log("No articles with suppliers found. Run data:import first.");
            return;
        }

        console.log(`\n=== Test Setup ===`);
        console.log(`Station: ${station.nom}`);
        console.log(`User: ${stationUser.nomComplet}`);
        console.log(`Articles found: ${articles.length}`);

        // Create a token for the station user
        const token = jwt.sign(
            { _id: stationUser._id, role: stationUser.role, entiteId: stationUser.entiteId },
            process.env.JWT_SECRET || 'your-secret-key'
        );

        console.log(`\n=== Step 1: Create Shopping List ===`);

        // Step 1: Add items to shopping list
        for (const article of articles) {
            const supplier = article.fournisseurs[0]; // Take first supplier
            const itemData = {
                articleId: article._id,
                fournisseurId: supplier.fournisseurId._id || supplier.fournisseurId,
                quantite: Math.floor(Math.random() * 3) + 1, // 1-3 items
                dateSouhaiteeLivraison: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };

            console.log(`Adding article: ${article.designation} (qty: ${itemData.quantite})`);
            console.log(`Supplier: ${supplier.fournisseurId.nom || 'Unknown'} (price: €${supplier.prixUnitaire})`);

            try {
                await axios.post(
                    'http://localhost:5000/api/listes-achat',
                    itemData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`✅ Added to shopping list`);
            } catch (error) {
                console.log(`❌ Error adding to list:`, error.response?.data || error.message);
            }
        }

        console.log(`\n=== Step 2: Validate Shopping List (Create Orders) ===`);

        // Step 2: Validate the shopping list to create orders
        try {
            const response = await axios.post(
                'http://localhost:5000/api/listes-achat/validate',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log(`\n🎉 Validation successful!`);
            console.log("Response:", response.data);
        } catch (error) {
            console.log(`\n❌ Validation failed:`);
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Error:", error.response.data);
            } else {
                console.log("Network Error:", error.message);
            }
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

testOrderCreationAPI();
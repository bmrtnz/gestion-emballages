// backend/scripts/test-list-validation.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load models
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Article = require("../models/articleModel");
const ListeAchat = require("../models/listeAchatModel");

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
    .then(() => console.log("MongoDB connected for list validation test."))
    .catch((err) => console.error(err));

const testListValidation = async () => {
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

        console.log(`Found station: ${station.nom}`);
        console.log(`Found ${articles.length} articles`);

        // Create a shopping list with real data
        const listeAchat = await ListeAchat.create({
            stationId: station._id,
            creeParId: stationUser._id,
            articles: articles.map(article => {
                const supplier = article.fournisseurs[0]; // Take first supplier
                return {
                    articleId: article._id,
                    fournisseurId: supplier.fournisseurId._id || supplier.fournisseurId, // Handle both cases
                    quantite: Math.floor(Math.random() * 5) + 1,
                    dateSouhaiteeLivraison: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                };
            })
        });

        console.log("Created shopping list with articles");

        // Simulate the controller by making an API call to validate
        const axios = require('axios');
        const jwt = require('jsonwebtoken');
        
        // Create a token for the station user
        const token = jwt.sign(
            { _id: stationUser._id, role: stationUser.role, entiteId: stationUser.entiteId },
            process.env.JWT_SECRET || 'your-secret-key'
        );

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
            
            console.log("Validation successful!");
            console.log("Response:", response.data);
        } catch (error) {
            if (error.response) {
                console.log("API Error:", error.response.status, error.response.data);
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

testListValidation();
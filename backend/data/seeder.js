// backend/data/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les modèles
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Fournisseur = require("../models/fournisseurModel");

// Charger les données initiales
const stations = require("./stations");
const fournisseurs = require("./fournisseurs");

// Charger les variables d'environnement
dotenv.config();

// Connexion à la DB
mongoose
    .connect(process.env.MONGO_URI_LOCAL)
    .then(() => console.log("MongoDB connecté pour le seeder."))
    .catch((err) => console.error(err));

const importData = async () => {
    try {
        // 1. Nettoyer la base
        await User.deleteMany();
        await Station.deleteMany();
        await Fournisseur.deleteMany();

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
            {
                nomComplet: "Laurent Ballage",
                email: "l.ballage@smurfit.com",
                password: "password123",
                role: "Fournisseur",
                entiteId: createdFournisseurs[0]._id,
            },
            {
                nomComplet: "Erica Gette",
                email: "e.gette@raja.fr",
                password: "password123",
                role: "Fournisseur",
                entiteId: createdFournisseurs[1]._id,
            },
        ];

        await User.create(usersToCreate);

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

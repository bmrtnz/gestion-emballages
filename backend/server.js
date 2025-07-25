// backend/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config/env");
const { checkBucket } = require("./config/minioClient");

const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const userRoutes = require("./routes/userRoutes");
const stationRoutes = require("./routes/stationRoutes");
const fournisseurRoutes = require("./routes/fournisseurRoutes");
const articleRoutes = require("./routes/articleRoutes");
const listeAchatRoutes = require("./routes/listeAchatRoutes");
const commandeRoutes = require("./routes/commandeRoutes");
const demandeTransfertRoutes = require("./routes/demandeTransfertRoutes");
const stockFournisseurRoutes = require("./routes/stockFournisseurRoutes");
const stockStationRoutes = require("./routes/stockStationRoutes");
const previsionRoutes = require("./routes/previsionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const commandeGlobaleRoutes = require("./routes/commandeGlobaleRoutes");

// Middlewares
app.use(cors()); // Activer CORS
app.use(express.json()); // Pour parser le JSON des requêtes

// Servir la documentation JSDoc statiquement
app.use('/docs', express.static('docs'));

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            docExpansion: "list",
            defaultModelsExpandDepth: 6,
            defaultModelExpandDepth: 6,
        },
    })
); // Documentation Swagger

app.use("/api/users", userRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/listes-achat", listeAchatRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/demandes-transfert", demandeTransfertRoutes);
app.use("/api/stocks-fournisseurs", stockFournisseurRoutes);
app.use("/api/stocks-stations", stockStationRoutes);
app.use("/api/previsions", previsionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/commandes-globales", commandeGlobaleRoutes);

// Connexion à MongoDB
mongoose
    .connect(config.mongoUri)
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

// Vérifier/Créer le bucket MinIO
checkBucket();

// Route de test
app.get("/", (req, res) => {
    res.send(`
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">🏭 API de Gestion des Emballages</h1>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #555; margin-top: 0;">📚 Documentation disponible :</h2>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #007bff;">
                        <strong>🔗 API REST Documentation (Swagger)</strong><br>
                        <a href="/api-docs" style="color: #007bff; text-decoration: none;">→ /api-docs</a>
                        <small style="color: #666; display: block; margin-top: 4px;">Documentation interactive des endpoints API</small>
                    </li>
                    <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #28a745;">
                        <strong>📖 Code Documentation (JSDoc)</strong><br>
                        <a href="/docs" style="color: #28a745; text-decoration: none;">→ /docs</a>
                        <small style="color: #666; display: block; margin-top: 4px;">Documentation technique du code source</small>
                    </li>
                </ul>
            </div>
            <footer style="text-align: center; color: #888; font-size: 14px; margin-top: 40px;">
                Serveur backend en cours d'exécution ✅
            </footer>
        </div>
    `);
});

app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT} en mode ${config.nodeEnv}`));

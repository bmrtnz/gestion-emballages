// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const { checkBucket } = require('./config/minioClient');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

const userRoutes = require('./routes/userRoutes');
const stationRoutes = require('./routes/stationRoutes');
const fournisseurRoutes = require('./routes/fournisseurRoutes');
const articleRoutes = require('./routes/articleRoutes');
const listeAchatRoutes = require('./routes/listeAchatRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const demandeTransfertRoutes = require('./routes/demandeTransfertRoutes');
const stockRoutes = require('./routes/stockRoutes');
const previsionRoutes = require('./routes/previsionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middlewares
app.use(cors()); // Activer CORS
app.use(express.json()); // Pour parser le JSON des requêtes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Documentation Swagger

app.use('/api/users', userRoutes); // Routes pour les utilisateurs
app.use('/api/stations', stationRoutes); // Routes pour les stations
app.use('/api/fournisseurs', fournisseurRoutes); // Routes pour les fournisseurs
app.use('/api/articles', articleRoutes); // Routes pour les articles
app.use('/api/listes-achat', listeAchatRoutes); // Routes pour les listes d'achat
app.use('/api/commandes', commandeRoutes); // Routes pour les commandes
app.use('/api/demandes-transfert', demandeTransfertRoutes); // Routes pour les demandes de transfert
app.use('/api/stocks', stockRoutes); // Routes pour les stocks
app.use('/api/previsions', previsionRoutes); // Routes pour les prévisions
app.use('/api/upload', uploadRoutes); // Routes pour l'upload de fichiers

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connecté à MongoDB via Docker'))
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Vérifier/Créer le bucket MinIO
checkBucket();

// Route de test
app.get('/', (req, res) => {
    res.send('<h1>API de Gestion des Emballages</h1><p>La documentation est disponible sur <a href="/api-docs">/api-docs</a></p>');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
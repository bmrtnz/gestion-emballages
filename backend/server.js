// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/env');
const { checkBucket } = require('./config/minioClient');

const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

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
const commandeGlobaleRoutes = require('./routes/commandeGlobaleRoutes');

// Middlewares
app.use(cors()); // Activer CORS
app.use(express.json()); // Pour parser le JSON des requêtes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Documentation Swagger

app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/listes-achat', listeAchatRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/demandes-transfert', demandeTransfertRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/previsions', previsionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/commandes-globales', commandeGlobaleRoutes);

// Connexion à MongoDB
mongoose.connect(config.mongoUri)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Vérifier/Créer le bucket MinIO
checkBucket();

// Route de test
app.get('/', (req, res) => {
    res.send('<h1>API de Gestion des Emballages</h1><p>La documentation est disponible sur <a href="/api-docs">/api-docs</a></p>');
});

app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT} en mode ${config.nodeEnv}`));

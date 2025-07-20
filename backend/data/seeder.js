// backend/data/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les modèles
const User = require("../models/userModel");
const Station = require("../models/stationModel");
const Fournisseur = require("../models/fournisseurModel");
const Article = require("../models/articleModel");
const Prevision = require("../models/previsionModel");

// Charger les utilitaires de seed
const { 
    clearMinIOBucket, 
    generateSupplierDocuments, 
    generateArticleImage 
} = require("./seedUtils");

// Charger la config MinIO locale pour le seeder
const Minio = require('minio');

// Create local MinIO client for seeder (bypass Docker service names)
const localMinioClient = new Minio.Client({
    endPoint: process.env.MINIO_EXTERNAL_HOST || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || 'VOTRE_ACCESS_KEY',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'VOTRE_SECRET_KEY'
});

const bucketName = 'documents';

// Local bucket check function
const checkBucket = () => {
    return new Promise((resolve, reject) => {
        localMinioClient.bucketExists(bucketName, (err, exists) => {
            if (err) {
                console.log('Erreur connexion MinIO:', err);
                return reject(err);
            }
            if (exists) {
                console.log(`Bucket MinIO "${bucketName}" trouvé.`);
                return resolve();
            }
            localMinioClient.makeBucket(bucketName, 'us-east-1', (err) => {
                if (err) {
                    console.log('Erreur création bucket:', err);
                    return reject(err);
                }
                console.log(`Bucket "${bucketName}" créé avec succès.`);
                resolve();
            });
        });
    });
};

// Charger les données initiales
const stations = require("./stations.json");
const fournisseurs = require("./suppliers.json"); // Utilise le nouveau fichier .json avec 24 fournisseurs
const articles = require("./articles.json");

// Charger les variables d'environnement
dotenv.config();

// Connexion à la DB - use local connection for seeder
const mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/gestionEmballages';
console.log(`Connecting to MongoDB: ${mongoUri}`);

mongoose
    .connect(mongoUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => console.log("MongoDB connecté pour le seeder."))
    .catch((err) => console.error(err));

const importData = async () => {
    try {
        // 1. Vérifier/créer le bucket MinIO
        console.log("Checking MinIO bucket...");
        await checkBucket();
        
        // Wait a bit for bucket creation if needed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 2. Nettoyer MinIO bucket
        console.log("Clearing MinIO bucket...");
        await clearMinIOBucket();

        // 2. Nettoyer la base
        await User.deleteMany();
        await Station.deleteMany();
        await Fournisseur.deleteMany();
        await Article.deleteMany();
        await Prevision.deleteMany();

        // 3. Préparer les fournisseurs avec documents uploadés
        console.log("Generating supplier documents...");
        const suppliersWithUploadedDocs = [];
        
        for (const supplier of fournisseurs) {
            const uploadedDocs = await generateSupplierDocuments(supplier);
            suppliersWithUploadedDocs.push({
                ...supplier,
                documents: uploadedDocs
            });
        }

        // 4. Insérer les données indépendantes
        const createdStations = await Station.insertMany(stations);
        const createdFournisseurs = await Fournisseur.insertMany(suppliersWithUploadedDocs);

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
        ];
        
        // Ajouter un utilisateur pour chaque station
        for (let i = 0; i < createdStations.length; i++) {
            const station = createdStations[i];
            const contact = station.contactPrincipal;
            
            if (contact) {
                usersToCreate.push({
                    nomComplet: contact.nom,
                    email: contact.email,
                    password: "password123",
                    role: "Station",
                    entiteId: station._id,
                });
            }
        }
        
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

        // 5. Traiter et insérer les articles
        console.log("Traitement des articles...");
        const processedArticles = [];
        let articleCount = 0;
        
        for (const article of articles) {
            const processedSuppliers = [];
            
            for (const supplier of article.fournisseurs) {
                let realSupplierId;
                let supplierName = "Unknown Supplier";
                
                // Extraire l'index du fournisseur depuis l'ID placeholder
                const supplierMatch = supplier.fournisseurId.match(/SUPPLIER_(\d+)_ID/);
                if (supplierMatch) {
                    const supplierIndex = parseInt(supplierMatch[1]) - 1; // Convert to 0-based index
                    if (supplierIndex >= 0 && supplierIndex < createdFournisseurs.length) {
                        realSupplierId = createdFournisseurs[supplierIndex]._id;
                        supplierName = createdFournisseurs[supplierIndex].nom;
                    } else {
                        // Si l'index est hors limites, utiliser un fournisseur aléatoire
                        const randomIndex = Math.floor(Math.random() * createdFournisseurs.length);
                        realSupplierId = createdFournisseurs[randomIndex]._id;
                        supplierName = createdFournisseurs[randomIndex].nom;
                    }
                } else {
                    // Fallback: fournisseur aléatoire
                    const randomIndex = Math.floor(Math.random() * createdFournisseurs.length);
                    realSupplierId = createdFournisseurs[randomIndex]._id;
                    supplierName = createdFournisseurs[randomIndex].nom;
                }
                
                // Generate image for this supplier's article
                let imageUrl = null;
                if (!supplier.imageUrl || supplier.imageUrl.startsWith('https://example.com')) {
                    // Only generate image if there's no existing one or if it's a placeholder
                    imageUrl = await generateArticleImage(article.codeArticle, article.designation, supplierName);
                }
                
                processedSuppliers.push({
                    fournisseurId: realSupplierId,
                    referenceFournisseur: supplier.referenceFournisseur,
                    prixUnitaire: supplier.prixUnitaire,
                    uniteConditionnement: supplier.uniteConditionnement,
                    quantiteParConditionnement: supplier.quantiteParConditionnement,
                    imageUrl: imageUrl || supplier.imageUrl,
                    documents: supplier.documents || []
                });
            }
            
            processedArticles.push({
                ...article,
                fournisseurs: processedSuppliers
            });
            
            articleCount++;
            if (articleCount % 500 === 0) {
                console.log(`Processed ${articleCount} articles...`);
            }
        }

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
        // Wait for MongoDB connection to be ready
        await mongoose.connection.asPromise();
        console.log("Connected to MongoDB for data destruction.");

        console.log("Deleting users...");
        await User.deleteMany();
        console.log("Users deleted.");

        console.log("Deleting stations...");
        await Station.deleteMany();
        console.log("Stations deleted.");

        console.log("Deleting suppliers...");
        await Fournisseur.deleteMany();
        console.log("Suppliers deleted.");

        console.log("Deleting articles...");
        await Article.deleteMany();
        console.log("Articles deleted.");

        console.log("Deleting previsions...");
        await Prevision.deleteMany();
        console.log("Previsions deleted.");

        console.log("Données détruites avec succès !");
        await mongoose.connection.close();
        process.exit();
    } catch (error) {
        console.error(`Erreur: ${error}`);
        await mongoose.connection.close();
        process.exit(1);
    }
};

if (process.argv[2] === "-d") {
    destroyData();
} else {
    importData();
}

/**
 * Script to fix prevision collection indexes
 * Run this script to remove old conflicting indexes and ensure proper unique constraints
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixPrevisionIndexes() {
    try {
        // Connect to MongoDB (try local first, then docker)
        const mongoUri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('previsions');

        // Get current indexes
        const currentIndexes = await collection.listIndexes().toArray();
        console.log('Current indexes:');
        currentIndexes.forEach(index => {
            console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Drop the problematic old index if it exists
        const problematicIndexName = 'campagne_1_fournisseurId_1_articleId_1';
        try {
            await collection.dropIndex(problematicIndexName);
            console.log(`✅ Dropped problematic index: ${problematicIndexName}`);
        } catch (error) {
            if (error.code === 27) {
                console.log(`ℹ️  Index ${problematicIndexName} does not exist (already removed)`);
            } else {
                console.log(`⚠️  Error dropping index ${problematicIndexName}:`, error.message);
            }
        }

        // Check for other problematic variations
        const problematicPatterns = [
            'campagne_1_fournisseurId_1_articleId_1',
            'campagne_1_fournisseurId_1',
        ];

        for (const pattern of problematicPatterns) {
            try {
                await collection.dropIndex(pattern);
                console.log(`✅ Dropped problematic index: ${pattern}`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`ℹ️  Index ${pattern} does not exist`);
                } else {
                    console.log(`⚠️  Error dropping index ${pattern}:`, error.message);
                }
            }
        }

        // Ensure the correct index exists
        try {
            await collection.createIndex(
                { campagne: 1, fournisseurId: 1, siteId: 1 }, 
                { unique: true, name: 'campagne_1_fournisseurId_1_siteId_1' }
            );
            console.log('✅ Created correct unique index: campagne_1_fournisseurId_1_siteId_1');
        } catch (error) {
            if (error.code === 85) {
                console.log('ℹ️  Correct index already exists');
            } else {
                console.log('⚠️  Error creating index:', error.message);
            }
        }

        // List final indexes
        const finalIndexes = await collection.listIndexes().toArray();
        console.log('\nFinal indexes:');
        finalIndexes.forEach(index => {
            console.log(`- ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the script
fixPrevisionIndexes();
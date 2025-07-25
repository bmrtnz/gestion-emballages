/**
 * Preview script for duplicate article designations
 * Shows what would be changed without making any modifications
 * 
 * Usage: node scripts/preview-duplicate-designations.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import all required models (to register schemas)
const Article = require('../models/articleModel');
const Fournisseur = require('../models/fournisseurModel');
// Import any other models that Article might reference
const User = require('../models/userModel');

// Database connection
const connectDB = async () => {
    try {
        // Try local connection first, then fallback to docker connection
        const mongoUri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/gestionEmballages';
        console.log(`🔗 Attempting to connect to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB (READ-ONLY MODE)');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('💡 Make sure MongoDB is running locally or update your .env file');
        process.exit(1);
    }
};

// Preview function - no modifications made
const previewDuplicateDesignations = async () => {
    try {
        console.log('🔍 Analyzing duplicate article designations...\n');

        // Aggregate to find duplicate designations
        const duplicates = await Article.aggregate([
            {
                $group: {
                    _id: '$designation',
                    articles: {
                        $push: {
                            id: '$_id',
                            designation: '$designation',
                            codeArticle: '$codeArticle',
                            isActive: '$isActive',
                            createdAt: '$createdAt',
                            fournisseurs: '$fournisseurs'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 } // Only get designations with more than 1 article
                }
            },
            {
                $sort: { count: -1 } // Sort by most duplicates first
            }
        ]);

        if (duplicates.length === 0) {
            console.log('✅ No duplicate designations found. Database is clean!');
            return;
        }

        console.log(`📊 PREVIEW: Found ${duplicates.length} designations with duplicates:`);
        console.log('🔍 This is what WOULD be changed (NO MODIFICATIONS MADE)');
        console.log('═'.repeat(80));

        let totalWouldUpdate = 0;
        let totalWouldProcess = 0;

        // Analyze each duplicate group
        for (const duplicate of duplicates) {
            const designation = duplicate._id;
            const articles = duplicate.articles;
            
            console.log(`\n📝 Designation: "${designation}" (${articles.length} articles)`);
            
            // Sort articles: active first, then by creation date (oldest first)
            const sortedArticles = articles.sort((a, b) => {
                // First, prioritize active articles
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                
                // If both have same active status, sort by creation date (oldest first)
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

            // Keep the first one (oldest active, or oldest if none active)
            const keepArticle = sortedArticles[0];
            const duplicatesToDeactivate = sortedArticles.slice(1);

            console.log(`   ✅ WOULD KEEP: ${keepArticle.codeArticle} (ID: ${keepArticle.id})`);
            console.log(`      📅 Created: ${new Date(keepArticle.createdAt).toLocaleDateString()}`);
            console.log(`      🔄 Currently Active: ${keepArticle.isActive}`);
            console.log(`      🏪 Suppliers: ${keepArticle.fournisseurs?.length || 0}`);

            // Show what would be deactivated
            for (const articleToDeactivate of duplicatesToDeactivate) {
                if (articleToDeactivate.isActive) {
                    console.log(`   ❌ WOULD DEACTIVATE: ${articleToDeactivate.codeArticle} (ID: ${articleToDeactivate.id})`);
                    console.log(`      📅 Created: ${new Date(articleToDeactivate.createdAt).toLocaleDateString()}`);
                    console.log(`      🏪 Suppliers: ${articleToDeactivate.fournisseurs?.length || 0}`);
                    totalWouldUpdate++;
                } else {
                    console.log(`   ⚪ ALREADY INACTIVE: ${articleToDeactivate.codeArticle} (ID: ${articleToDeactivate.id})`);
                }
                totalWouldProcess++;
            }
        }

        console.log('\n' + '═'.repeat(80));
        console.log(`📈 PREVIEW SUMMARY:`);
        console.log(`   • Duplicate designations found: ${duplicates.length}`);
        console.log(`   • Total duplicate articles that would be processed: ${totalWouldProcess}`);
        console.log(`   • Articles that would be deactivated: ${totalWouldUpdate}`);
        console.log(`   • Articles already inactive: ${totalWouldProcess - totalWouldUpdate}`);
        console.log('═'.repeat(80));

        if (totalWouldUpdate > 0) {
            console.log('⚠️  Run the fix-duplicate-designations.js script to apply these changes.');
        } else {
            console.log('ℹ️  No articles need to be deactivated.');
        }

        // Show current state statistics
        const totalArticles = await Article.countDocuments();
        const activeArticles = await Article.countDocuments({ isActive: true });
        const inactiveArticles = totalArticles - activeArticles;

        console.log('\n📊 CURRENT DATABASE STATISTICS:');
        console.log(`   • Total articles: ${totalArticles}`);
        console.log(`   • Active articles: ${activeArticles}`);
        console.log(`   • Inactive articles: ${inactiveArticles}`);

    } catch (error) {
        console.error('❌ Error analyzing duplicate designations:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        
        console.log('🔍 PREVIEW MODE: Analyzing duplicate designations...');
        console.log('📋 This script will NOT make any changes to your database\n');
        
        await previewDuplicateDesignations();

    } catch (error) {
        console.error('💥 Preview failed:', error);
        process.exit(1);
    } finally {
        mongoose.connection.close();
        console.log('\n📡 Database connection closed.');
        process.exit(0);
    }
};

// Run the script
if (require.main === module) {
    main();
}

module.exports = { previewDuplicateDesignations };
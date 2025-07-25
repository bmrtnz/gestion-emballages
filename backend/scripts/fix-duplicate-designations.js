/**
 * Script to fix duplicate article designations
 * Marks all duplicated articles as invalid (isActive = false) except the first active one
 * 
 * Usage: node scripts/fix-duplicate-designations.js
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
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('💡 Make sure MongoDB is running locally or update your .env file');
        process.exit(1);
    }
};

// Main script function
const fixDuplicateDesignations = async () => {
    try {
        console.log('🔍 Searching for duplicate article designations...\n');

        // Aggregate to find duplicate designations (bypasses mongoose hooks)
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
                            createdAt: '$createdAt'
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

        console.log(`📊 Found ${duplicates.length} designations with duplicates:`);
        console.log('─'.repeat(80));

        let totalUpdated = 0;
        let totalProcessed = 0;

        // Process each duplicate group
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

            console.log(`   ✅ KEEPING: ${keepArticle.codeArticle} (ID: ${keepArticle.id}) - Active: ${keepArticle.isActive}`);

            // Deactivate the duplicates (using updateOne to bypass hooks)
            for (const articleToDeactivate of duplicatesToDeactivate) {
                if (articleToDeactivate.isActive) {
                    await Article.updateOne(
                        { _id: articleToDeactivate.id },
                        { 
                            $set: {
                                isActive: false,
                                updatedAt: new Date()
                            },
                            // Add a note about why it was deactivated
                            $push: {
                                notes: {
                                    text: `Deactivated due to duplicate designation: "${designation}"`,
                                    date: new Date(),
                                    type: 'system'
                                }
                            }
                        }
                    );
                    
                    console.log(`   ❌ DEACTIVATED: ${articleToDeactivate.codeArticle} (ID: ${articleToDeactivate.id})`);
                    totalUpdated++;
                } else {
                    console.log(`   ⚪ ALREADY INACTIVE: ${articleToDeactivate.codeArticle} (ID: ${articleToDeactivate.id})`);
                }
                totalProcessed++;
            }
        }

        console.log('\n' + '═'.repeat(80));
        console.log(`📈 SUMMARY:`);
        console.log(`   • Duplicate designations found: ${duplicates.length}`);
        console.log(`   • Total duplicate articles processed: ${totalProcessed}`);
        console.log(`   • Articles deactivated: ${totalUpdated}`);
        console.log(`   • Articles already inactive: ${totalProcessed - totalUpdated}`);
        console.log('═'.repeat(80));

        if (totalUpdated > 0) {
            console.log('✅ Duplicate cleanup completed successfully!');
        } else {
            console.log('ℹ️  No articles needed to be deactivated.');
        }

    } catch (error) {
        console.error('❌ Error fixing duplicate designations:', error);
        throw error;
    }
};

// Verification function to check results
const verifyResults = async () => {
    console.log('\n🔍 Verifying results...');
    
    // Use aggregation to avoid hooks
    const remainingDuplicates = await Article.aggregate([
        {
            $match: { isActive: true } // Only check active articles
        },
        {
            $group: {
                _id: '$designation',
                count: { $sum: 1 },
                articles: {
                    $push: {
                        codeArticle: '$codeArticle',
                        id: '$_id'
                    }
                }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]);

    if (remainingDuplicates.length === 0) {
        console.log('✅ Verification successful: No active duplicate designations remain!');
    } else {
        console.log(`⚠️  WARNING: Still found ${remainingDuplicates.length} active duplicate designations:`);
        remainingDuplicates.forEach(dup => {
            console.log(`   - "${dup._id}": ${dup.articles.map(a => a.codeArticle).join(', ')}`);
        });
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        
        console.log('🚀 Starting duplicate designation cleanup...');
        console.log('⚠️  This script will mark duplicate articles as inactive (isActive = false)');
        console.log('📋 Strategy: Keep the first active article, deactivate all others with same designation\n');
        
        // Ask for confirmation (skip in CI or test environments)
        let confirm = false;
        if (process.env.NODE_ENV === 'test' || process.argv.includes('--force')) {
            confirm = true;
            console.log('✅ Auto-confirmed (test mode or --force flag)');
        } else {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            confirm = await new Promise(resolve => {
                rl.question('Do you want to proceed? (y/N): ', answer => {
                    rl.close();
                    resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
                });
            });
        }

        if (!confirm) {
            console.log('❌ Operation cancelled by user.');
            return;
        }

        await fixDuplicateDesignations();
        await verifyResults();

    } catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    } finally {
        mongoose.connection.close();
        console.log('📡 Database connection closed.');
        process.exit(0);
    }
};

// Run the script
if (require.main === module) {
    main();
}

module.exports = { fixDuplicateDesignations, verifyResults };
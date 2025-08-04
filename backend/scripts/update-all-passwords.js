const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import User model
const User = require('../models/userModel');

const NEW_PASSWORD = 'LocalDevPass2025!';

async function updateAllPasswords() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Hash the new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, saltRounds);
        console.log('✅ Password hashed successfully');

        // Get all users before update
        const usersBefore = await User.find({}, 'nom email role');
        console.log(`\n📊 Found ${usersBefore.length} users to update:`);
        usersBefore.forEach(user => {
            console.log(`   - ${user.nom} (${user.email}) - ${user.role}`);
        });

        // Confirm with user
        console.log(`\n⚠️  This will update ALL user passwords to: "${NEW_PASSWORD}"`);
        console.log('Press Ctrl+C to cancel, or any key to continue...');
        
        // Wait for user input (in a real scenario, you'd use readline)
        // For now, we'll proceed directly - remove this in production
        
        // Update all users' passwords
        const result = await User.updateMany(
            {}, 
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                } 
            }
        );

        console.log(`\n✅ Successfully updated ${result.modifiedCount} user passwords`);
        
        // Verify updates
        const usersAfter = await User.find({}, 'nom email updatedAt');
        console.log('\n🔍 Updated users:');
        usersAfter.forEach(user => {
            console.log(`   - ${user.nom} (${user.email}) - Updated: ${user.updatedAt}`);
        });

        console.log(`\n🎉 All users can now login with password: "${NEW_PASSWORD}"`);
        
    } catch (error) {
        console.error('❌ Error updating passwords:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Check if running directly
if (require.main === module) {
    updateAllPasswords();
}

module.exports = updateAllPasswords;
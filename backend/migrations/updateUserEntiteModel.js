// migrations/updateUserEntiteModel.js
const mongoose = require('mongoose');
const User = require('../models/userModel');
const config = require('../config/env');

const migrateUsers = async () => {
  try {
    await mongoose.connect(config.databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const usersToUpdate = await User.find({ 
        $or: [{ role: 'Station' }, { role: 'Fournisseur' }],
        entiteModel: { $exists: false } 
    });

    if (usersToUpdate.length === 0) {
      console.log('No users to update.');
      return;
    }

    for (const user of usersToUpdate) {
      user.entiteModel = user.role;
      await user.save();
      console.log(`Updated user: ${user.email}`);
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

migrateUsers();

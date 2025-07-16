const mongoose = require('mongoose');
const Station = require('../models/stationModel');
require('dotenv').config();

const reactivateAllStations = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Set all stations to active
        const result = await Station.updateMany(
            {},
            { 
                $set: { isActive: true } 
            }
        );

        console.log(`Reactivated ${result.modifiedCount} stations`);
        
        // Verify the update
        const totalStations = await Station.countDocuments({});
        const activeStations = await Station.countDocuments({ isActive: true });
        
        console.log(`Total stations: ${totalStations}, Active stations: ${activeStations}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
};

reactivateAllStations();
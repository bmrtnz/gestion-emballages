const mongoose = require('mongoose');
const Station = require('../models/stationModel');
require('dotenv').config();

const addIsActiveToStations = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Update all stations that don't have isActive field or have it as null/undefined
        const result = await Station.updateMany(
            { 
                $or: [
                    { isActive: { $exists: false } },
                    { isActive: null },
                    { isActive: undefined }
                ]
            },
            { 
                $set: { isActive: true } 
            }
        );

        console.log(`Updated ${result.modifiedCount} stations with isActive: true`);
        
        // Verify the update
        const stationsWithoutIsActive = await Station.countDocuments({
            $or: [
                { isActive: { $exists: false } },
                { isActive: null },
                { isActive: undefined }
            ]
        });
        
        console.log(`Stations without isActive field remaining: ${stationsWithoutIsActive}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

addIsActiveToStations();
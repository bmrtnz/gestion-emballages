import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DatabaseSeeder } from './database.seeder';

const logger = new Logger('DatabaseSeeder');

async function runSeeder() {
  logger.log('Starting NestJS application for seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(DatabaseSeeder);

  try {
    logger.log('Running database seeder...');
    await seeder.run();
    logger.log('Seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === '--help' || command === '-h') {
  logger.log(`
🌱 Database Seeder Commands:

  npm run seed                Run the database seeder
  npm run seed:help          Show this help message

📋 What gets seeded:
  - 4 Stations (cooperatives)
  - 4 Suppliers with sites
  - 9 Users (admin, managers, station users, supplier users)
  - 15 Articles (packaging items)
  - Product-Supplier relationships with pricing
  - Initial stock data for stations

🔐 Default Credentials:
  - Admin: admin@dev.com / admin123
  - Manager: nicole@embadif.com / password123
  - Station: j.martin@valdegaronne.com / password123
  - Supplier: f.martinez@emballages-so.fr / password123
  - Test Station: station@test.com / password123
  - Test Supplier: supplier@test.com / password123

⚠️  Note: This will clear all existing data in the database!
  `);
  process.exit(0);
}

runSeeder();

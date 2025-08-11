import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Migration-specific datasource for TypeORM CLI
// Entities are excluded to avoid path resolution issues with the CLI
const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'dev_user',
  password: process.env.DB_PASSWORD || 'dev_password',
  database: process.env.DB_DATABASE || 'blue_whale_portal_dev',
  entities: [], // No entities needed for CLI operations
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Always false for migrations
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default MigrationDataSource;
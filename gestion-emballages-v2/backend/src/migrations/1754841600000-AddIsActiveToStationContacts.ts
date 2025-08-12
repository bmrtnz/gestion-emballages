import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToStationContacts1754841600000 implements MigrationInterface {
    name = 'AddIsActiveToStationContacts1754841600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "station_contacts" 
            ADD COLUMN "is_active" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "station_contacts" 
            DROP COLUMN "is_active"
        `);
    }
}
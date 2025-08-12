import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIsActiveFromStationContacts1754842000000 implements MigrationInterface {
    name = 'RemoveIsActiveFromStationContacts1754842000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "station_contacts" 
            DROP COLUMN "is_active"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "station_contacts" 
            ADD COLUMN "is_active" boolean NOT NULL DEFAULT true
        `);
    }
}
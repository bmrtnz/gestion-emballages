import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditFieldsToStations1754769000000 implements MigrationInterface {
    name = 'AddAuditFieldsToStations1754769000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add audit fields to stations table
        await queryRunner.query(`ALTER TABLE "stations" ADD "created_by" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "stations" ADD "updated_by" uuid`);

        // Add audit fields to station_contacts table  
        await queryRunner.query(`ALTER TABLE "station_contacts" ADD "created_by" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "station_contacts" ADD "updated_by" uuid`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "stations" ADD CONSTRAINT "FK_stations_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "stations" ADD CONSTRAINT "FK_stations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL`);
        
        await queryRunner.query(`ALTER TABLE "station_contacts" ADD CONSTRAINT "FK_station_contacts_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "station_contacts" ADD CONSTRAINT "FK_station_contacts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "station_contacts" DROP CONSTRAINT "FK_station_contacts_updated_by"`);
        await queryRunner.query(`ALTER TABLE "station_contacts" DROP CONSTRAINT "FK_station_contacts_created_by"`);
        await queryRunner.query(`ALTER TABLE "stations" DROP CONSTRAINT "FK_stations_updated_by"`);
        await queryRunner.query(`ALTER TABLE "stations" DROP CONSTRAINT "FK_stations_created_by"`);

        // Drop audit fields from station_contacts table
        await queryRunner.query(`ALTER TABLE "station_contacts" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "station_contacts" DROP COLUMN "created_by"`);

        // Drop audit fields from stations table
        await queryRunner.query(`ALTER TABLE "stations" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "stations" DROP COLUMN "created_by"`);
    }
}
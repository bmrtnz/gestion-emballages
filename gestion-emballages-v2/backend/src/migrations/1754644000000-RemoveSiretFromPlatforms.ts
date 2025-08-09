import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSiretFromPlatforms1754644000000 implements MigrationInterface {
    name = 'RemoveSiretFromPlatforms1754644000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platforms" DROP COLUMN IF EXISTS "siret"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platforms" ADD "siret" character varying(14)`);
    }
}
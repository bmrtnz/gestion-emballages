import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeSpecialtiesToJsonb1754770000000 implements MigrationInterface {
    name = 'ChangeSpecialtiesToJsonb1754770000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the platforms table exists first
        const tableExists = await queryRunner.hasTable('platforms');
        if (!tableExists) {
            // Table doesn't exist yet, no need to migrate
            return;
        }

        // Check if specialties column exists and is text type
        const table = await queryRunner.getTable('platforms');
        const specialtiesColumn = table?.findColumnByName('specialties');
        
        if (specialtiesColumn && specialtiesColumn.type === 'text') {
            // Convert existing text data to jsonb array format
            await queryRunner.query(`
                UPDATE platforms 
                SET specialties = CASE 
                    WHEN specialties IS NULL THEN NULL
                    WHEN specialties = '' THEN '[]'::jsonb
                    ELSE CAST('["' || REPLACE(REPLACE(specialties, '"', '\"'), ',', '","') || '"]' AS jsonb)
                END
                WHERE specialties IS NOT NULL
            `);

            // Change column type from text to jsonb
            await queryRunner.query(`ALTER TABLE "platforms" ALTER COLUMN "specialties" TYPE jsonb USING specialties::jsonb`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if the platforms table exists first
        const tableExists = await queryRunner.hasTable('platforms');
        if (!tableExists) {
            return;
        }

        // Convert jsonb back to text
        await queryRunner.query(`
            UPDATE platforms 
            SET specialties = CASE 
                WHEN specialties IS NULL THEN NULL
                WHEN specialties = '[]'::jsonb THEN ''
                ELSE REPLACE(REPLACE(specialties::text, '["', ''), '"]', '')
            END
            WHERE specialties IS NOT NULL
        `);

        // Change column type back to text
        await queryRunner.query(`ALTER TABLE "platforms" ALTER COLUMN "specialties" TYPE text`);
    }
}
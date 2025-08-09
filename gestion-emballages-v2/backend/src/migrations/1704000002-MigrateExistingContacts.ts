import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateExistingContacts1704000002 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migrate contacts from platform_sites to platform_contacts
    await queryRunner.query(`
      INSERT INTO platform_contacts (
        id,
        platform_id,
        nom_complet,
        poste,
        telephone,
        email,
        est_principal,
        is_active,
        created_at,
        updated_at
      )
      SELECT 
        gen_random_uuid(),
        ps.platform_id,
        COALESCE(ps.nom, p.nom) || ' - Contact',
        CASE WHEN ps.is_principal THEN 'Contact Site Principal' ELSE 'Contact Site' END,
        ps.telephone,
        ps.email,
        ps.is_principal,
        ps.is_active,
        NOW(),
        NOW()
      FROM platform_sites ps
      INNER JOIN platforms p ON p.id = ps.platform_id
      WHERE ps.telephone IS NOT NULL OR ps.email IS NOT NULL
    `);

    // Create default contacts for platforms without any contacts
    await queryRunner.query(`
      INSERT INTO platform_contacts (
        id,
        platform_id,
        nom_complet,
        poste,
        est_principal,
        is_active,
        created_at,
        updated_at
      )
      SELECT 
        gen_random_uuid(),
        p.id,
        p.nom || ' - Contact Principal',
        'Contact Principal',
        true,
        true,
        NOW(),
        NOW()
      FROM platforms p
      WHERE NOT EXISTS (
        SELECT 1 FROM platform_contacts pc WHERE pc.platform_id = p.id
      )
      AND p.is_active = true
    `);

    // Create default contacts for active fournisseurs
    await queryRunner.query(`
      INSERT INTO fournisseur_contacts (
        id,
        fournisseur_id,
        nom_complet,
        poste,
        est_principal,
        is_active,
        created_at,
        updated_at
      )
      SELECT 
        gen_random_uuid(),
        f.id,
        f.nom || ' - Contact Principal',
        'Contact Principal',
        true,
        true,
        NOW(),
        NOW()
      FROM fournisseurs f
      WHERE f.is_active = true
    `);

    // Migrate contacts from station legacy contact_principal field if exists
    const hasStationContacts = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_name = 'stations' 
      AND column_name = 'contact_principal'
    `);

    if (hasStationContacts[0]?.count > 0) {
      await queryRunner.query(`
        INSERT INTO station_contacts (
          id,
          station_id,
          nom_complet,
          telephone,
          email,
          poste,
          est_principal,
          is_active,
          created_at,
          updated_at
        )
        SELECT 
          gen_random_uuid(),
          s.id,
          COALESCE((s.contact_principal->>'nom')::text, s.nom || ' - Contact'),
          (s.contact_principal->>'telephone')::text,
          (s.contact_principal->>'email')::text,
          'Contact Principal (Migré)',
          true,
          true,
          NOW(),
          NOW()
        FROM stations s
        WHERE s.contact_principal IS NOT NULL 
        AND s.contact_principal != '{}'::jsonb
        AND NOT EXISTS (
          SELECT 1 FROM station_contacts sc 
          WHERE sc.station_id = s.id 
          AND sc.est_principal = true
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove migrated contacts (keeping only manually created ones)
    await queryRunner.query(`
      DELETE FROM platform_contacts 
      WHERE poste IN ('Contact Site Principal', 'Contact Site', 'Contact Principal')
    `);

    await queryRunner.query(`
      DELETE FROM fournisseur_contacts 
      WHERE poste = 'Contact Principal'
    `);

    await queryRunner.query(`
      DELETE FROM station_contacts 
      WHERE poste = 'Contact Principal (Migré)'
    `);
  }
}
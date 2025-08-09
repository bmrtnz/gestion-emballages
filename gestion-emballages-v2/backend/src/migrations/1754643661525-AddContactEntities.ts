import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class AddContactEntities1754643661525 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create fournisseur_contacts table
    await queryRunner.createTable(
      new Table({
        name: 'fournisseur_contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'fournisseur_id',
            type: 'uuid',
          },
          {
            name: 'nom_complet',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'poste',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'telephone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'est_principal',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['fournisseur_id'],
            referencedTableName: 'fournisseurs',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['created_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['updated_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create platform_contacts table
    await queryRunner.createTable(
      new Table({
        name: 'platform_contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'platform_id',
            type: 'uuid',
          },
          {
            name: 'nom_complet',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'poste',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'telephone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'est_principal',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['platform_id'],
            referencedTableName: 'platforms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['created_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['updated_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance
    await queryRunner.query(`CREATE INDEX "IDX_fournisseur_contacts_fournisseur_principal" ON "fournisseur_contacts" ("fournisseur_id", "est_principal")`);
    await queryRunner.query(`CREATE INDEX "IDX_fournisseur_contacts_active" ON "fournisseur_contacts" ("fournisseur_id", "is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_platform_contacts_platform_principal" ON "platform_contacts" ("platform_id", "est_principal")`);
    await queryRunner.query(`CREATE INDEX "IDX_platform_contacts_active" ON "platform_contacts" ("platform_id", "is_active")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('fournisseur_contacts', 'IDX_fournisseur_contacts_fournisseur_principal');
    await queryRunner.dropIndex('fournisseur_contacts', 'IDX_fournisseur_contacts_active');
    await queryRunner.dropIndex('platform_contacts', 'IDX_platform_contacts_platform_principal');
    await queryRunner.dropIndex('platform_contacts', 'IDX_platform_contacts_active');

    // Drop tables
    await queryRunner.dropTable('fournisseur_contacts');
    await queryRunner.dropTable('platform_contacts');
  }
}
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStationContacts1704067300000 implements MigrationInterface {
  name = 'CreateStationContacts1704067300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'station_contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'nom_complet',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'poste',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'telephone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
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
            name: 'station_id',
            type: 'uuid',
            isNullable: false,
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
            columnNames: ['station_id'],
            referencedTableName: 'stations',
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

    // Create indexes
    await queryRunner.query('CREATE INDEX IDX_station_contacts_station_id ON station_contacts (station_id)');
    await queryRunner.query('CREATE INDEX IDX_station_contacts_nom_complet ON station_contacts (nom_complet)');
    await queryRunner.query('CREATE INDEX IDX_station_contacts_email ON station_contacts (email)');
    await queryRunner.query('CREATE INDEX IDX_station_contacts_est_principal ON station_contacts (est_principal)');
    await queryRunner.query('CREATE INDEX IDX_station_contacts_is_active ON station_contacts (is_active)');

    // Create unique constraint to ensure only one principal contact per station
    await queryRunner.query(`
      CREATE UNIQUE INDEX IDX_station_contacts_principal_unique 
      ON station_contacts (station_id) 
      WHERE est_principal = true AND is_active = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('station_contacts');
  }
}
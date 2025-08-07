import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddGroupeToStations1704067400000 implements MigrationInterface {
  name = 'AddGroupeToStations1704067400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add groupe_id column to stations table
    await queryRunner.addColumn(
      'stations',
      new TableColumn({
        name: 'groupe_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'stations',
      new TableForeignKey({
        columnNames: ['groupe_id'],
        referencedTableName: 'station_groups',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_stations_groupe_id',
      }),
    );

    // Add index for performance
    await queryRunner.query('CREATE INDEX IDX_stations_groupe_id ON stations (groupe_id)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key and index
    await queryRunner.dropForeignKey('stations', 'FK_stations_groupe_id');
    await queryRunner.dropIndex('stations', 'IDX_stations_groupe_id');
    
    // Drop column
    await queryRunner.dropColumn('stations', 'groupe_id');
  }
}
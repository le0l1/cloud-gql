/* eslint-disable class-methods-use-this */
import { Table } from 'typeorm';

export class address1561646765723 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'cloud_address',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'character varying',
          },
          {
            name: 'phone',
            type: 'character varying',
          },
          {
            name: 'province',
            type: 'character varying',
          },
          {
            name: 'city',
            type: 'character varying',
          },
          {
            name: 'district',
            type: 'character varying',
          },
          {
            name: 'address',
            type: 'character varying',
          },
          {
            name: 'is_default',
            type: 'boolean',
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner) {
    queryRunner.dropTable('cloud_address');
  }
}

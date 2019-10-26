import { Table } from 'typeorm';

export class ShopCategoryRefactoring1572082988055 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'cloud_shop_category',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'shop_id',
            type: 'int',
            comment: '商户id',
          },
          {
            name: 'category_id',
            type: 'int',
            comment: '分类id',
          },
          {
            name: 'index',
            type: 'int',
            comment: '排名',
            default: 0,
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner) {
    queryRunner.dropTable('cloud_shop_category');
  }
}

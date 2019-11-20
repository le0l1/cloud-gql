import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decodeTypeAndId, decodeNumberId, pipe } from '../../helper/util';
import { Good } from '../good/good.entity';
import { Shop } from '../shop/shop.entity';
import {
  getQB, where, getMany, leftJoinAndMapOne, orderBy, leftJoinAndMapMany,
} from '../../helper/sql';
import { ShopCategory } from '../shop/shopCategory.entity';
import { Category } from '../category/category.entity';

@Entity()
export class Recommend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Column({ type: 'character varying', comment: 'the path of recommend' })
  route

  @Column({
    type: 'character varying',
    name: 'recommend_type',
  })
  recommendType

  @Column({
    type: 'int',
    name: 'recommend_type_id',
  })
  recommendTypeId

  @Column({
    type: 'int',
    name: 'index',
    comment: '排名',
    default: 0,
  })
  index;

  @Column({
    type: 'timestamp',
    comment: 'when the record has been deleted',
    name: 'delete_at',
    nullable: true,
  })
  deletedAt

  static async createRecommend({ route, typeId, index = 1 }) {
    return Recommend.storeRecommends(route, typeId, index);
  }

  static async storeRecommends(route, recommnedNode, index) {
    try {
      const [recommendType, recommendTypeId] = decodeTypeAndId(recommnedNode);
      const { id } = await Recommend.create({
        route,
        index,
        recommendType,
        recommendTypeId,
      }).save();
      return {
        id,
        status: true,
      };
    } catch (e) {
      throw e;
    }
  }

  static async searchRecommend({ route }) {
    const recommend = await Recommend.findOne({
      where: {
        route,
      },
    });
    if (!recommend) return [];
    let qb = pipe(
      getQB('recommend'),
      where('recommend.route = :route', { route }),
      orderBy({
        'recommend.index': 'ASC',
      }),
    )(Recommend);

    if (recommend.recommendType === 'shop') {
      qb = pipe(
        leftJoinAndMapOne('recommend.recommendNode', Shop, 'shop', 'shop.id = recommend.recommendTypeId'),
        leftJoinAndMapOne('category.shopCategory', ShopCategory, 'shopCategory', 'shop.id = shopCategory.shopId'),
        leftJoinAndMapMany('shop.categories', Category, 'category', 'category.id = shopCategory.categoryId'),
        where('shop.deletedAt is null'),
      )(qb);
    } else {
      qb = pipe(
        leftJoinAndMapOne('recommend.recommendNode', Good, 'good', 'good.id = recommend.recommendTypeId'),
        where('good.deletedAt is null'),
      )(qb);
    }
    return getMany(qb);
  }

  static async updateRecommend({ id, index }) {
    const recommend = await Recommend.findOneOrFail(decodeNumberId(id));
    await Recommend.update(recommend.id, { index });
    return {
      id: recommend.id,
      status: true,
    };
  }

  static async deleteRecommend({ id }) {
    try {
      const realId = decodeNumberId(id);
      await Recommend.delete(realId);
      return {
        id: realId,
        status: true,
      };
    } catch (e) {
      throw e;
    }
  }
}

import {
  BaseEntity,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decodeTypeAndId, decodeNumberId, pipe } from '../../helper/util';
import { Good } from '../good/good.entity';
import { Shop } from '../shop/shop.entity';
import {
  getQB, where, getMany, leftJoinAndMapMany, leftJoinAndMapOne,
} from '../../helper/sql';
import { ShopCategory } from '../shop/shopCategory.entity';
import { Category } from '../category/category.entity';

@Entity()
export class Recommend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Index()
  @Column({ type: 'character varying', comment: 'the path of recommend' })
  route

  @Column({
    type: 'character varying',
    name: 'recommend_type',
  })
  recommendType

  @Column({
    type: 'character varying',
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
    const recommends = await Recommend.find({
      where: {
        route,
      },
      order: {
        index: 'ASC',
      },
    });
    if (!recommends.length) return [];
    const recommendClass = {
      good: ids => Good.findByIds(ids),
      shop: ids => pipe(
        getQB('shop'),
        leftJoinAndMapOne('category.shopCategory', ShopCategory, 'shopCategory', 'shop.id = shopCategory.shopId'),
        leftJoinAndMapMany('shop.categories', Category, 'category', 'category.id = shopCategory.categoryId'),
        where('shop.id IN (:...ids)', { ids }),
        where('shop.deletedAt is null'),
        getMany,
      )(Shop),
    };

    const nodeIds = recommends.map(a => a.recommendTypeId);
    const res = await recommendClass[recommends[0].recommendType](nodeIds);
    return res.map((node, idx) => ({
      ...recommends[idx],
      route,
      recommendNode: node,
    }));
  }

  static async updateRecommend({ id, index }) {
    const recommend = await Recommend.findOneOrFail(decodeNumberId(id));
    await Recommend.merge(recommend, { index }).save();
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

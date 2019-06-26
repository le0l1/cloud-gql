import {
  BaseEntity,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { tryStatement } from '@babel/types';
import { decodeID, decodeIDAndType, decodeNumberId } from '../../helper/util';
import { Good } from '../good/good.entity';
import { Shop } from '../shop/shop.entity';

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
    type: 'timestamp',
    comment: 'when the record has been deleted',
    name: 'delete_at',
    nullable: true,
  })
  deletedAt

  static async createRecommend({ route, typeId }) {
    return Recommend.storeRecommends(route, typeId);
  }

  static async storeRecommends(route, recommnedNode) {
    try {
      const [recommendType, recommendTypeId] = decodeIDAndType(recommnedNode);
      const { id } = await Recommend.create({
        route,
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
      where: { route },
    });
    if (!recommends.length) return [];

    const recommendClass = {
      good: Good,
      shop: Shop,
    };
    const nodeIds = recommends.map(a => a.recommendTypeId);
    const res = await recommendClass[recommends[0].recommendType].findByIds(nodeIds);

    return res.map(node => ({
      route,
      recommendNode: node,
    }));
  }

  // static async updateRecommend ({ route, typeIds }) {
  //   try {
  //     await Recommend.delete({
  //       route
  //     })
  //     return Recommend.createRecommend({ route, typeIds })
  //   } catch (e) {
  //     return {
  //       status: false
  //     }
  //   }
  // }

  static async deleteRecommend({ id }) {
    try {
      const realId = decodeNumberId(id);
      await Recommend.delete({
        id: realId,
      });
      return {
        id: realId,
        status: true,
      };
    } catch (e) {
      throw e;
    }
  }
}

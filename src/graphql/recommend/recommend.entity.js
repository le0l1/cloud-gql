import {
  BaseEntity,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm'
import { decodeID, decodeIDAndType } from '../../helper/id'
import { Good } from '../good/good.entity'
import { Shop } from '../shop/shop.entity'

@Entity()
export class Recommend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Index()
  @Column({ type: 'character varying', comment: 'the path of recommend' })
  route

  @Column({
    type: 'character varying',
    name: 'recommend_type'
  })
  recommendType

  @Column({
    type: 'character varying',
    name: 'recommend_type_id'
  })
  recommendTypeId

  @Column({
    type: 'timestamp',
    comment: 'when the record has been deleted',
    name: 'delete_at',
    nullable: true
  })
  deletedAt

  static async createRecommend ({ route, typeIds }) {
    try {
      await Recommend.save(Recommend.makeRecommends(route, typeIds))
      return {
        status: true
      }
    } catch (e) {
      console.trace(e)
      return {
        status: false
      }
    }
  }

  static makeRecommends (route, arr) {
    return arr.map(t => {
      const [recommendType, recommendTypeId] = decodeIDAndType(t)
      return Recommend.create({
        route,
        recommendType,
        recommendTypeId
      })
    })
  }

  static async searchRecommend ({ route }) {
    const  recommends  = await Recommend.find({
      where: { route }
    })
    if (!recommends.length) return []

    const recommendClass = {
      good: Good ,
      shop: Shop
    }
    const nodeIds = recommends.map(a => a.id)
    const res = await recommendClass[recommends[0].recommendType].findByIds(nodeIds)

    return res.map(node => ({
      route,
      recommendNode: node
    }))
  }

  static async updateRecommend ({ route,  typeIds }) {
    try {
      await  Recommend.delete({
        route
      })
      return  Recommend.createRecommend({ route, typeIds})
    } catch (e) {
      return {
        status: false
      }
    }
  }

  static deleteRecommend ({ id }) {
    return Recommend.update(decodeID(id), { deletedAt: new Date() }).then(
      () => ({
        id,
        status: true
      })
    )
  }
}

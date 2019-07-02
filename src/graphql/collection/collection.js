import { decodeNumberId, decodeTypeAndId } from '../../helper/util';
import Collection from './collection.entity';
import { User } from '../user/user.entity';
import { Good } from '../good/good.entity';
import { Shop } from '../shop/shop.entity';

export default class CollectionResolver {
  static async createCollection({ userId, typeId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const [type, tid] = decodeTypeAndId(typeId);
    const params = await (type === 'shop' ? Shop.findOneOrFail(tid) : Good.findOneOrFail(tid));
    return Collection.save({
      userId: user.id,
      type,
      typeId: params.id,
    });
  }

  static async searchCollections({ userId, type }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const mapType = type === 'shop' ? Shop : Good;
    return mapType.createQueryBuilder('mapType')
      .leftJoinAndSelect('mapType.categories', 'categories')
      .where((qb) => {
        const subQuery = qb.subQuery().select('collection.typeId').from(Collection, 'collection')
          .where('collection.userId = :userId and collection.type = :type ')
          .getQuery();
        return `mapType.id in ${subQuery}`;
      })
      .setParameters({
        type,
        userId: user.id,
      })
      .getMany();
  }

  static async deleteCollection({ userId, typeId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const [type, tid] = decodeTypeAndId(typeId);
    const params = await (type === 'shop' ? Shop.findOneOrFail(tid) : Good.findOneOrFail(tid));
    return Collection.delete({
      userId: user.id,
      type,
      typeId: params.id,
    });
  }
}

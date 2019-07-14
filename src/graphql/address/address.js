import { getManager } from 'typeorm';
import { User } from '../user/user.entity';
import { decodeNumberId } from '../../helper/util';
import Address from './address.entity';

export default class AddressResolver {
  static  createAddress({ userId, ...rest }) {
    return getManager().transaction(async trx => {
      const user = await User.findOneOrFail(decodeNumberId(userId));
      const address = await Address.findOne(user);
      const saveAddress = (obj = {}) => Address.save({
          user,
          ...rest,
          ...obj,
      })
      if (rest.isDefault) {
        await AddressResolver.clearDefaultAddress(user, trx);
      }
      return saveAddress();
    })
  }

  static updateAddress({ id, ...rest }) {
    return getManager().transaction(async (trx) => {
      const address = await Address.findOneOrFail({
        where: {
          id: decodeNumberId(id),
        },
        relations: ['user'],
      });
      if (rest.isDefault && !address.isDefault) {
        await AddressResolver.clearDefaultAddress(address.user, trx);
      }
      await trx.save(Address.merge(address, rest));
      return address;
    });
  }

  static deleteAddress({ id }) {
    const realId = decodeNumberId(id);
    return Address.delete(realId).then(() => ({
      id: realId,
    }));
  }

  static async searchAddress({ userId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return Address.find({
      where: {
        user,
      },
      order: {
        isDefault: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  static async searchDefaultAddress({ userId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return Address.findOne({
      where: {
        user,
        isDefault: true,
      },
    });
  }

  static clearDefaultAddress(user, trx) {
    return trx.update(Address, { user, isDefault: true }, { isDefault: false });
  }
}

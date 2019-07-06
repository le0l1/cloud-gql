import { User } from '../user/user.entity';
import { decodeNumberId } from '../../helper/util';
import Address from './address.entity';

export default class AddressResolver {
  static async createAddress({ userId, ...rest }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return Address.save({
      user,
      ...rest,
    });
  }

  static async updateAddress({ id, ...rest }) {
    const address = await Address.findOneOrFail(decodeNumberId(id));
    return Address.merge(address, rest).save();
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
}

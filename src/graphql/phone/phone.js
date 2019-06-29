import { Shop } from '../shop/shop.entity';
import { Phone } from './phone.entity';
import { decodeNumberId } from '../../helper/util';

export default class PhoneResolver {
  static async searchPhones({ shopId }) {
    const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
    return Phone.find({ shop });
  }

  /**
   * Update Phone Count
   * @param id
   * @param rest
   * @returns {Promise<UpdateResult>}
   */
  static async updatePhone({ id, ...rest }) {
    const phone = await Phone.findOneOrFail(decodeNumberId(id));
    return Phone.merge(phone, rest).save();
  }
}

import { Shop } from '../shop/shop.entity';
import { Phone } from './phone.entity';
import { decodeNumberId } from '../../helper/util';
import PhoneRecord from '../phoneRecord/phoneRecord.entity';

export default class PhoneResolver {
  static async searchPhones({ shopId }) {
    const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
    const phones = await Phone.find({ shop });
    const phoneCount = await PhoneRecord.count({
      where: {
        shopId: shop.id,
      },
    });
    if (phones.length) {
      phones.splice(0, 1, Phone.merge(phones[0], { count: phoneCount }));
    }
    return phones;
  }

  /**
   * Update Phone Count
   * @param id
   * @param rest
   * @returns {Promise<UpdateResult>}
   */
  static async updatePhone({ id, ...rest }) {
    // const phone = await Phone.findOneOrFail(decodeNumberId(id));
    // return Phone.merge(phone, rest).save();
  }
}

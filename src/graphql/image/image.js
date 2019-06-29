import { decodeIDAndType } from '../../helper/util';
import { Shop } from '../shop/shop.entity';
import { Image } from './image.entity';

export default class ImageResolver {
  static async searchImages({ imageTypeId }) {
    const [_, typeId] = decodeIDAndType(imageTypeId);
    const shop = await Shop.findOneOrFail(typeId);
    return Image.find({
      shop,
    });
  }
}

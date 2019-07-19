import { Good } from '../good/good.entity';
import { decodeNumberId } from '../../helper/util';
import { StockLackError } from '../../helper/error';
import Cart from './cart.entity';
import { User } from '../user/user.entity';
import { Shop } from '../shop/shop.entity';

export default class CartResolver {
  static async createCart({ goodId, quantity, userId }) {
    const good = await Good.findOneOrFail(decodeNumberId(goodId));
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const cart = await Cart.findOne({
      where: {
        good,
        user,
      },
      relations: ['good'],
    });
    const stocks = Number(good.goodsStocks);
    const cartStocks = cart ? Number(cart.quantity) + Number(quantity) : Number(quantity);
    if (stocks < cartStocks) throw new StockLackError();
    if (cart) {
      cart.quantity += Number(quantity);
      return Cart.save(cart);
    }
    return Cart.save({
      user,
      good,
      quantity,
    });
  }

  static async updateCart({ id, quantity }) {
    const cart = await Cart.findOneOrFail({
      where: {
        id: decodeNumberId(id),
      },
      relations: ['good'],
    });
    if (Number(cart.good.goodsStocks) < Number(quantity)) throw new StockLackError();
    cart.quantity = quantity;
    return Cart.save(cart);
  }

  static async getCarts({ userId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return Cart.createQueryBuilder('cart')
      .leftJoinAndSelect('cart.good', 'good')
      .leftJoinAndMapOne('cart.shop', Shop, 'shop', 'shop.id = good.shop')
      .andWhere('cart.user = :user', { user: user.id })
      .orderBy({
        'cart.createdAt': 'DESC',
      })
      .getMany();
  }

  static deleteCart({ id }) {
    const realId = decodeNumberId(id);
    return Cart.delete(realId).then(() => ({
      id: realId,
    }));
  }
}

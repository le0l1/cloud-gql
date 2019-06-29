import {Shop} from "./shop.entity";
import {decodeNumberId} from "../../helper/util";
import {Category} from "../category/category.entity";

export default class ShopResolver  {
  static  async createShop(params) {
    params.name && (await this.checkNameUnique(params.name));
    const user = User.findOneOrFail(decodeNumberId(params.belongto));
    return Shop.create(params).save();
  }

  static async updateShop({ id, belongto, ...rest }) {
    const shop = Shop.findOneOrFail(decodeNumberId(id));
    const user = Shop.findOneOrFail(decodeNumberId(belongto));
  }
}

import { ShopFetch } from "./shop.fetch";
import { formateID } from "../../src/helper/id";
import { CategoryFetch } from "../category/category.fetch";

const shopFetch = new ShopFetch();
const categoryFetch = new CategoryFetch();
const shopId = formateID("shop", 1);
const userId = formateID("user", 1);
const shopInfo = {
  name: "测试店铺8"
};

const getCategory = () =>
  categoryFetch.createCategory({
    name: "汽车轿车",
    status: "NORMAL",
    tag: "A"
  });

describe("Shop", () => {
  it("should create shop correct", async () => {
    const { createShop } = await shopFetch.createShop({
      belongto: userId,
      shopImages: [
        "http://pr67w6y6s.bkt.clouddn.com/FnFQfB79duu715bo4dbzvKkcBDhX"
      ],
      ...shopInfo
    });
    expect(createShop.id).toBe(shopId);
  });

  it("should fetch correct when tsQuery", async () => {
    const query = {
      filter: { status: "NORMAL" },
      isPassed: false,
      limit: 10,
      offset: 1,
      tsQuery: "测试"
    };
    const { shops } = await shopFetch.fetchShops(query);
    expect(shops.edges[0]).toMatchObject(shopInfo);
  });

  it("should update correct", async () => {
    const { createCategory } = await getCategory();
    const newShopInfo = {
      address: null,
      description: null,
      isPassed: false,
      name: "测试店铺8",
      phones: [11111111, 2222222, 333],
      qqchat: 8181239,
      shopBanners: ["http://oss.dafengge.top/FlYHiGm-XTsyMjrGBFtNshLqDnP_"],
      status: "NORMAL",
      wechat: "asd"
    };
    await shopFetch.updateShop({
      id: shopId,
      coreBusiness: [ createCategory.id ],
      ...newShopInfo
    });
    const { shop } = await shopFetch.fetchSingleShop({
      id: shopId
    });
    expect(shop).toMatchObject(newShopInfo);
    expect(shop.coreBusiness[0].id).toBe(createCategory.id)
  });
});

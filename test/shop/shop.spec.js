import { ShopFetch } from "./shop.fetch";
import { formateID } from "../../src/helper/id";

const shopFetch = new ShopFetch();
const shopId = formateID("shop", 1);
const userId = formateID("user", 1);
const shopInfo = {
  name: "leo12",
};

describe("Shop", () => {
  it("should create shop correct", async () => {
    const { createShop } = await shopFetch.createShop({
      belongto: userId,
      shopImages: ["http://pr67w6y6s.bkt.clouddn.com/FnFQfB79duu715bo4dbzvKkcBDhX"],
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
      tsQuery: "leo"
    };
    const { shops } = await shopFetch.fetchShops(query);
    expect(shops.edges[0]).toMatchObject(shopInfo);
  });

  it('should update correct', async () => {
    const newShopInfo = {
      address: "asd",
      isPassed: true,
      phones: [1111111111, 2222, 3333]
    }
    await shopFetch.updateShop({
      id: shopId,
      ...newShopInfo
    })
    const { shop } = await shopFetch.fetchSingleShop({
      id: shopId
    })
    expect(shop).toMatchObject(newShopInfo);
  })
});

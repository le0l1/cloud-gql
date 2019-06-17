import { GoodFetch } from "./good.fetch";
import { CategoryFetch } from "../category/category.fetch";
import { formateID } from "../../src/helper/id";

let categoryId;
const categoryFetch = new CategoryFetch();
const goodFetch = new GoodFetch();
const goodId = formateID("good", 1);
const goodInfo = {
  shopId: "c2hvcC8xMDA1",
  goodSalePrice: 999,
  goodParamter: "<div>123</div>"
};

const getCategory = () =>
  categoryFetch.createCategory({
    name: "汽车轿车",
    status: "NORMAL",
    tag: "A"
  });

describe("Good", () => {
  it("should be able to create good", async () => {
    const { createCategory } = await getCategory();
    categoryId = createCategory.id;
    const res = await goodFetch.createGood({
      ...goodInfo,
      banners: [
        "http://pr67w6y6s.bkt.clouddn.com/FnFQfB79duu715bo4dbzvKkcBDhX"
      ],
      categories: [categoryId]
    });
    expect(res.createGood.id).toBe(goodId);
  });

  it("should fetch good info correct", async () => {
    const { good } = await goodFetch.fetchGood(goodId);
    const expectedGood = {
      ...goodInfo,
      categories: [
        {
          id: categoryId
        }
      ]
    };
    expect(good).toMatchObject(expectedGood);
  });

  it("should update good info correct", async () => {
    const newGoodInfo = {
      categories: [],
      description: "123456",
      goodSalePrice: null,
      goodsSales: 1000,
      goodsStocks: 99,
      name: "巴拉巴拉",
      shopId: "c2hvcC8xMDAy",
      status: "ONLINE",
      subTitle: "66666"
    };

    await goodFetch.updateGood({
      id: goodId,
      banners: [
        "http://pr67w6y6s.bkt.clouddn.com/FhkQE9aroxo9rsaZ1tqNSFAZSDm1"
      ],
      ...newGoodInfo
    });
    const { good } = await goodFetch.fetchGood(goodId);
    expect(good).toMatchObject(newGoodInfo);
  });
});

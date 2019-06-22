import { ShopFetch } from './shop.fetch'
import { formateID } from '../../src/helper/id'
import { CategoryFetch } from '../category/category.fetch'
import { PhoneFetch } from '../phone/phone.fetch'

let categoryId
const shopFetch = new ShopFetch()
const categoryFetch = new CategoryFetch()
const phoneFetch = new PhoneFetch()
const shopId = formateID('shop', 1)
const userId = formateID('user', 1)
const shopInfo = {
  name: '测试店铺8',
}

const getCategory = () =>
  categoryFetch.createCategory({
    name: '汽车轿车',
    status: 'NORMAL',
    tag: 'A'
  })

describe('Shop', () => {
  it('should create shop correct', async () => {
    const { createCategory } = await getCategory()
    categoryId = createCategory.id
    const { createShop } = await shopFetch.createShop({
      belongto: userId,
      categories: [categoryId],
      shopImages: [
        'http://pr67w6y6s.bkt.clouddn.com/FnFQfB79duu715bo4dbzvKkcBDhX'
      ],
      ...shopInfo
    })
    expect(createShop.id).toBe(shopId)
  })

  it('should fetch correct when using tsQuery', async () => {
    const query = {
      filter: { status: 'NORMAL' },
      isPassed: false,
      limit: 10,
      offset: 1,
      tsQuery: '测试'
    }
    const { shops } = await shopFetch.fetchShops(query)
    expect(shops.edges[0]).toMatchObject(shopInfo)

  })

  it('should fetch correct when using categoryId', async () => {
    const { createCategory } = await getCategory()
    const categoryQuery = {
      categoryId
    }
    const { shops } = await shopFetch.fetchShops(categoryQuery)
    expect(shops.edges[0]).toMatchObject(shopInfo)
    const missingQuery = {
      categoryId: createCategory.id
    }
    const { shops: missingShop } = await shopFetch.fetchShops(missingQuery)
    expect(missingShop.edges).toEqual([])
  })

  it('should update correct', async () => {
    const { createCategory } = await getCategory()
    const newPhones = [18888888888, 2222222, 333]
    const newShopInfo = {
      address: null,
      description: null,
      isPassed: false,
      name: '测试店铺8',
      qqchat: 8181239,
      shopBanners: ['http://oss.dafengge.top/FlYHiGm-XTsyMjrGBFtNshLqDnP_'],
      status: 'NORMAL',
      wechat: 'asd'
    }
    await shopFetch.updateShop({
      id: shopId,
      categories: [createCategory.id],
      phones: newPhones,
      ...newShopInfo
    })
    const { shop, phones } = await shopFetch.fetchSingleShop(shopId)
    expect(phones.map(a => Number(a.phone))).toEqual(newPhones)
    expect(shop).toMatchObject(newShopInfo)
    expect(shop.phone).toBe(phones[0].phone)
    expect(shop.categories[0].id).toBe(createCategory.id)
  })

  it('should update shop phone correct correct', async () => {
    const { phones } = await phoneFetch.searchPhones(shopId)
    await phoneFetch.updatePhone({
      id: phones[0].id,
      count: 1000,
    })

    const { phones: afterUpdate } = await phoneFetch.searchPhones(shopId)
    const updatedPhone = afterUpdate.find(a => a.id === phones[0].id);
    expect(updatedPhone.count).toBe(1000);
  })
})

import { RecommendFetch } from './recommend.fetch'
import { ShopFetch } from '../shop/shop.fetch'
import { GoodFetch } from '../good/good.fetch'

const recommendFetch = new RecommendFetch()
const shopFetch = new ShopFetch()
const goodFetch = new GoodFetch()
const recommend = {
  route: 'test'
}

const seachRecommendAndAssert = async () => {
  const { recommends } = await recommendFetch.searchRecommend({
    route: recommend.route
  })
  expect(recommends[0].recommendNode.id).toBe(recommend.typeIds[0])
}

describe('Recommend', () => {
  beforeAll(async () => {
    const { createGood } = await goodFetch.createGood()
    recommend.typeIds = [createGood.id]
  })

  it('should create correct', async () => {
    const { createRecommend } = await recommendFetch.createRecommend(recommend)
    recommend.id = createRecommend.id
    expect(createRecommend.status).toBeTruthy()
  })

  it('should fetch recommend correct', async () => {
    await seachRecommendAndAssert()
  })

  it('should update recommend correct', async () => {
    const { createShop } = await shopFetch.createShop()
    recommend.typeIds = [createShop.id]
    const { updateRecommend } = await recommendFetch.updateRecommend(recommend)
    expect(updateRecommend.status).toBeTruthy()
  })

  it('should fetch recommend correct after update', () => {
    setTimeout(async () => {
      await seachRecommendAndAssert()
    })
  })
})

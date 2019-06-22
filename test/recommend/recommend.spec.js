import { RecommendFetch } from './recommend.fetch'
import { ShopFetch } from '../shop/shop.fetch'
import { GoodFetch } from '../good/good.fetch'

const recommendFetch = new RecommendFetch()
const shopFetch = new ShopFetch()
const goodFetch = new GoodFetch()
const recommend = {
  route: 'test'
}

const seachRecommendAndAssert = async (result) => {
  const { recommends } = await recommendFetch.searchRecommend({
    route: recommend.route
  })
  expect(recommends[0].recommendNode.id).toBe(result)
}

describe('Recommend', () => {
  beforeAll(async () => {
    const { createGood } = await goodFetch.createGood()
    recommend.typeId = createGood.id
  })

  it('should create correct', async () => {
    const { createRecommend } = await recommendFetch.createRecommend(recommend)
    recommend.id = createRecommend.id
    expect(createRecommend.status).toBeTruthy()
  })

  it('should fetch recommend correct', async () => {
    await seachRecommendAndAssert(recommend.typeId)
  })

  it('should delete recommend correct', async () => {
    const { deleteRecommend } = await recommendFetch.deleteRecommend({
      id: recommend.id
    })
    expect(deleteRecommend.status).toBeTruthy()
    setTimeout(async () => {
      await  seachRecommendAndAssert(undefined);
    }, 300)
  })
})

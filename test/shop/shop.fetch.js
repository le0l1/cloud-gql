import { BaseFetch } from '../baseFetch'
import { formateID } from '../../src/helper/id'

const userId = formateID('user', 1)


export class ShopFetch extends BaseFetch {
  updateShop (shopInfo) {
    const updateShop = `
      mutation updateShop($input: ShopUpdateInput!) {
        updateShop(shopUpdateInput: $input) {
          id
          status
        }
      }
    `

    return this.client.request(updateShop, {
      input: shopInfo
    })
  }

  createShop (input = {
    name: '测试店铺9102312',
    belongto: userId
  }) {
    const mutation = `
      mutation createShop($input: ShopCreateInput!) {
        createShop(shopCreateInput: $input) {
          id,
          status
        }
      }
    `
    return this.client.request(mutation, { input })
  }

  fetchShops (input) {
    const query = `
      query shops($input: ShopsQueryInput) {
        shops(query: $input) {
          edges {
            id
            name
            description
            isPassed
            belongto
            shopImages
          }
        }
      }
    `
    return this.client.request(query, { input })
  }

  fetchSingleShop (input) {
    const query = `
      query shop($input: ID!) {
        shop(query: { id: $input }) {
          address
          categories {
            id
          }
          description
          id
          isPassed
          name
          qqchat
          shopBanners
          status
          wechat
          phone
        }
        phones(query: { shopId: $input }) {
          phone
        }
      }
    `
    return this.client.request(query, { input })
  }
}

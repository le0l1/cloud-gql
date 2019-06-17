import { BaseFetch } from "../baseFetch";
import { gql } from "apollo-server-koa";

export class ShopFetch extends BaseFetch {
  updateShop(shopInfo) {
    const updateShop = gql`
      mutation updateShop($input: ShopUpdateInput!) {
        updateShop(shopUpdateInput: $input) {
          id
          status
        }
      }
    `;

    return this.client.request(updateShop, {
      input: shopInfo
    });
  }

  createShop(input) {
    const mutation = `
      mutation createShop($input: ShopCreateInput!) {
        createShop(shopCreateInput: $input) {
          id,
          status
        }
      }
    `
    return this.client.request(mutation, { input})
  }

  fetchShops(input) {
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
}

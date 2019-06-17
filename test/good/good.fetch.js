import { BaseFetch } from "../baseFetch";

export class GoodFetch extends BaseFetch {
  async createGood(goodInfo) {
    const mutation = `
      mutation createGood($input: GoodCreateInput!) {
        createGood(createGoodInput: $input) {
          id
          status
        }
      }
    `;
    return this.client.request(mutation, {
      input: goodInfo
    });
  }
  updateGood(goodInfo) {
    const mutation = `
      mutation updateGood($updateInput: GoodUpdateInput!) {
        updateGood(updateGoodInput: $updateInput) {
          id
          status
        }
      }
    `;
    return this.client.request(mutation, {
      updateInput: goodInfo
    });
  }
  fetchGood(id) {
    const query = `
      query good($input: GoodSearchInput!){
        good(query: $input) {
          categories {
            id
          }
          description
          goodSalePrice
          goodParamter
          goodsSales
          goodsStocks
          name
          shopId
          status
          subTitle
        }
      }
    `
    return this.client.request(query, {
      input: {
        id
      }
    })
  }
}

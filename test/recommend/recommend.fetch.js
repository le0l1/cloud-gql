import { BaseFetch } from '../baseFetch'

export class RecommendFetch extends  BaseFetch {
  searchRecommend(input) {
    return this.client.request(`
        query recommend($input: RecommendSearchInput!){
            recommends(searchRecommendInput: $input) {
                route
                recommendNode {
                  ... on Shop {
                    id
                  }
                  ... on Good {
                    id
                  }
                }
            }
        }
    `, { input })
  }

  createRecommend(input = {
    route: 'test'
  }) {
    return this.client.request(`
      mutation  createRecommend($input: RecommendCreateInput!) {
          createRecommend(createRecommendInput: $input) {
              status
          }
      }
    `, { input })
  }

  deleteRecommend(input = {
    route: 'input'
  }) {
    return this.client.request(`
      mutation  deleteRecommend($input: RecommendDeleteInput!) {
          deleteRecommend(deleteRecommendInput: $input) {
              status
          }
      }
    `, { input })
  }
}

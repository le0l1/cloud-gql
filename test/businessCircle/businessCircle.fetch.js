import { BaseFetch } from '../baseFetch'

export class BusinessCircleFetch extends BaseFetch {
  createBusinessCircle (input) {
    return this.client.request(
      `
         mutation createCircle($input: BusinessCircleCreateInput!) {
            createBusinessCircle(createBusinessCircleInput: $input) {
              id
              status
            }
         }
      `,
      { input }
    )
  }

  searchBusinessCircles () {
    return this.client.request(
      `
          query circle {
              businessCircles {
                  pageInfo {
                      total
                  }
                  edges {
                      id
                      ... on BusinessCircle {
                          id
                          reportStatus
                          publishAt
                          content
                          user {
                              id
                              name
                              profilePicture
                          }
                          images
                      }
                  }
              }
          }
      `
    )
  }
}

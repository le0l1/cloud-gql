import { BaseFetch } from "../baseFetch";

export class CategoryFetch extends BaseFetch {
  createCategory(input) {
    const mutation = `
      mutation createCategory($input: CategoryCreateInput!) {
        createCategory(category: $input) {
          id
          status
        }
      }
    `
    return this.client.request(mutation, {
      input
    })
  }
  fetchCategorys(input) {
    const query = `
      query categorys($input:CategorysQuery) {
        categorys(query: $input) {
          id
        }
      }
    `
    return this.client.request(query, { input })
  }
}
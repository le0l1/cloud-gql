import { BaseFetch } from '../baseFetch'

export  class PhoneFetch extends BaseFetch {
  updatePhone(input) {
    return this.client.request(`
        mutation updatePhone($input: UpdatePhoneInput!) {
            updatePhone(updatePhoneInput: $input) {
                id
                status
            }
        }
    `, { input })
  }
  searchPhones(input) {
    return this.client.request(`
      query phone($input: ID!){
          phones(query: { shopId: $input }) {
              id
              shopId
              phone
              count
          }
      }
    `, { input })
  }
}

import { PhoneFetch } from './phone.fetch'
import { formateID } from '../../src/helper/id'
import { Phone } from '../../src/graphql/phone/phone.entity'

let phone
const phoneFetch = new PhoneFetch()
const shopId = formateID('shop', 1)

const fetchPhoneAndAssert = async () => {
  const { phones } = await phoneFetch.searchPhones(shopId)
  expect(phones[0].shopId).toBe(shopId)
  expect(phones[0]).toMatchObject(phone)
}

describe('Phone', () => {
  beforeAll(async () => {
    phone = Phone.create({
      shopId: 1,
      phone: 112312312312,
      count: 100
    })
    await phone.save()
  })
  it('should fetch correct', async () => {
    await fetchPhoneAndAssert()
  })
})

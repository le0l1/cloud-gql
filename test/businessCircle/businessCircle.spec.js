import { BusinessCircleFetch } from './businessCircle.fetch'
import { UserFetch } from '../user/user.fetch'

const businessCircleFetch = new BusinessCircleFetch()
const userFetch = new UserFetch()
const businessCircle = {
  'content': '测试生意圈',
  'images': ['http://pr67w6y6s.bkt.clouddn.com/FnFQfB79duu715bo4dbzvKkcBDhX']
}

describe('BusinessCircle', () => {
  beforeAll(async () => {
    const { register: { id } } = await userFetch.register({
      phone: 1111111111,
      name: 'leo',
      address: 'china',
      password: '123',
      smsCode: '000000'
    })
    businessCircle.userId = id
  })

  it('should create correct', async () => {
    const { createBusinessCircle } = await businessCircleFetch.createBusinessCircle(businessCircle)
    businessCircle.id = createBusinessCircle.id
    expect(createBusinessCircle.status).toBeTruthy()
  })

  it('should fecth business circle connection correct', async () => {
    const { businessCircles: { edges } } = await businessCircleFetch.searchBusinessCircles()
    const { user, ...rest } = edges[0]
    expect({
      ...rest,
      userId: user.id
    }).toMatchObject(businessCircle)
  })
})

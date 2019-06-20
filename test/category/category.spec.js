import { CategoryFetch } from './category.fetch'
import { formateID } from '../../src/helper/id'

let categoryId
let childrenCategoryId
const categoryFetch = new CategoryFetch()
const categoryInfo = {
  name: '汽车轿车',
  status: 'NORMAL',
  tag: 'A'
}

describe('Category', () => {
  it('should create category correct', async () => {
    const { createCategory } = await categoryFetch.createCategory(categoryInfo)
    categoryId = createCategory.id
    expect(createCategory.status).toBeTruthy()
  })

  it('should create children category correct', async () => {
    const { createCategory } = await categoryFetch.createCategory({
      parentId: categoryId,
      ...categoryInfo
    })
    childrenCategoryId = createCategory.id
    expect(createCategory.status).toBeTruthy()
  })

  it('should get relation correct', async () => {
    const { categorys } = await categoryFetch.fetchCategorys({ id: categoryId })
    expect(categorys[0].id).toBe(childrenCategoryId)
  })

  it('shoud update category info correct', async () => {
    const newCategoryInfo = {
      name: '汽车轿车123',
      tag: 'B',
      id: childrenCategoryId,
    }
    await categoryFetch.updateCategory(newCategoryInfo)
    const { categorys } = await categoryFetch.fetchCategorys({ id: categoryId });
    expect(categorys[0]).toMatchObject(newCategoryInfo)
  })

})

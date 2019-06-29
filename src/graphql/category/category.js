import { getTreeRepository } from 'typeorm';
import { Category } from './category.entity';
import { decodeNumberId, prop, select } from '../../helper/util';


export default class CategoryResolver {
  static async createCategory({ parentId = null, ...rest }) {
    if (!parentId) {
      return Category.save(rest);
    }
    const parentCategory = await Category.findOneOrFail(decodeNumberId(parentId));
    return Category.create({
      parent: parentCategory,
      ...rest,
    }).save();
  }

  static async updateCategory({ id, ...rest }) {
    const category = await Category.findOneOrFail(decodeNumberId(id));
    return Category.merge(category, rest).save();
  }

  static async searchCategory({ id }) {
    return Category.findOneOrFail(decodeNumberId(id));
  }

  static async searchCategories(params) {
    const findByRoute = ({ route }) => Category.find({
      where: { route, deletedAt: null },
    });
    const findRoot = async ({ root }) => {
      const roots = await Category.find({ route: root, parent: null, deletedAt: null });
      const treeRepository = getTreeRepository(Category);
      return Promise.all(roots.map(r => treeRepository.createDescendantsQueryBuilder('category', 'categoryClosure', r)
        .andWhere('category.deletedAt is null')
        .getRawAndEntities()
        .then((entitiesAndScalars) => {
          const relationMaps = treeRepository.createRelationMaps('category', entitiesAndScalars.raw);
          treeRepository.buildChildrenEntityTree(r, entitiesAndScalars.entities, relationMaps);
          return r;
        })));
    };
    const findById = async ({ id }) => {
      const realId = decodeNumberId(id);
      const parent = await Category.findOneOrFail(realId);
      return Category.find({
        parent,
        deletedAt: null,
      });
    };
    return select([
      [
        prop('route'),
        findByRoute,
      ],
      [
        prop('id'),
        findById,
      ],
      [
        prop('root'),
        findRoot,
      ],
    ], [])(params);
  }

  static async deleteCategory({ id }) {
    const category = await Category.findOneOrFail(decodeNumberId(id));
    category.deletedAt = new Date();
    return Category.save(category);
  }
}

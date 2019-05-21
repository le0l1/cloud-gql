import { formateID, decodeID } from "../../helper/id";
import { excuteQuery, isValid, withConditions } from "../../helper/util";
import { Category } from "./category.entity";

export const createCategoryModel = db => ({
  async createCategory({ parentId = null, ...rest}) {
    const currentCategory = Category.create({
      ...rest
    });

    if (isValid(parentId)) {
      const parentCategory = new Category();
      parentCategory.id = Number(decodeID(parentId));
      currentCategory.parent = parentCategory;
    }

    const { id } = await currentCategory.save();

    return {
      id: formateID("category", id),
      status: true
    };
  },
  deleteCategory({ id }) {
    const deleteFn = async client => {
      const res = await client.query("DELETE FROM cloud_category WHERE id=$1", [
        decodeID(id)
      ]);
      return {
        id,
        status: true
      };
    };
    return excuteQuery(db)(deleteFn);
  },
  searchCategorys({ route, id }) {
    const parentCategory = new Category();
    if (isValid(id)) {
      parentCategory.id = decodeID(id);
    }
    if (isValid(route)) {
      parentCategory.route = route;
    }
    
    if (!parentCategory.id && !parentCategory.route) {
      return getTreeRepository(Category).findTrees();
    }
    
    return getTreeRepository(Category)
      .findDescendantsTree(parentCategory)
      .then(({ children }) => children);
  },
  // update category
  updateCategory({ id, ...rest }) {
    const updateFn = async client => {
      const updateKeys = Object.keys(rest)
        .map((b, i) => {
          return `${b}=$${i + 1}`;
        })
        .join(",");
      const queryStr = `update cloud_category set ${updateKeys} where id = $${Object.keys(
        rest
      ).length + 1}`;
      const res = await client.query(queryStr, [
        ...Object.values(rest),
        decodeID(id)
      ]);
      return {
        id,
        status: true
      };
    };

    return excuteQuery(db)(updateFn);
  },
  async searchCategory({ id }) {
    if (!isValid(id)) {
      return {};
    }
    const res = await Category.findOne({
      where: {
        id: decodeID(id)
      },
      relations: ["shops"]
    });
    return res
  }
});

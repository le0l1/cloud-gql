import { formateID, decodeID } from "../../helper/id";
import { excuteQuery, isValid, withConditions } from "../../helper/util";
import { Category } from "./category.entity";

export const createCategoryModel = db => ({
  async createCategory({ name, status, tag, parentId = null, route, image }) {
    const currentCategory = new Category();
    currentCategory.name = name;
    currentCategory.status = status;
    currentCategory.tag = tag;
    currentCategory.route = route;
    currentCategory.image = image;

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
  searchCategory({ route, id }) {
    return  Category.getCategoryTree(id, route);
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
  }
});

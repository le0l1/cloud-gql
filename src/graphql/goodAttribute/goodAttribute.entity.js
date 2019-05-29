import {
  BaseEntity,
  Entity,
  Tree,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  getTreeRepository
} from "typeorm";
import { isValid, flatEntitiesTree } from "../../helper/util";
import { decode } from "punycode";
import { formateID, decodeID, decodeNumberId } from "../../helper/id";
import { goodAttribute } from ".";

@Entity()
@Tree("closure-table")
export class GoodAttribute extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    name: "attr_value"
  })
  attrValue;

  @Column({
    type: "int",
    name: "good_id"
  })
  goodId;

  @TreeChildren()
  specs;

  @TreeParent()
  parent;

  static createAttribute({ attrValue, parentId, goodId }) {
    const currenAttribute = GoodAttribute.create({
      attrValue,
      goodId: decodeNumberId(goodId)
    });

    if (isValid(parentId)) {
      currenAttribute.parent = GoodAttribute.create({
        id: decodeNumberId(parentId)
      });
    }

    return currenAttribute.save().then(({ id }) => ({
      id: formateID("attribute", id),
      status: true
    }));
  }

  static searchAttribute({ goodId }) {
    return GoodAttribute.createQueryBuilder("goodAttribute")
      .innerJoin(
        getTreeRepository(GoodAttribute).metadata.closureJunctionTable
          .tableName,
        "goodAttributeClosure",
        "goodAttributeClosure.id_descendant = goodAttribute.id"
      )
      .where(qb => {
        const subQuery = qb
          .subQuery()
          .select("id")
          .from(GoodAttribute, "goodAttribute")
          .where(
            "goodAttribute.goodId = :goodId and goodAttribute.parent is null"
          )
          .getQuery();
        return "goodAttributeClosure.id_ancestor IN" + subQuery;
      })
      .setParameter("goodId", decodeNumberId(goodId))
      .getRawAndEntities()
      .then(res => {
        const relationMap = res.raw.map(
          ({ goodAttribute_id: id, goodAttribute_parentId: parent }) => ({
            id,
            parent
          })
        );
        return flatEntitiesTree(res.entities, relationMap);
      });
  }
}

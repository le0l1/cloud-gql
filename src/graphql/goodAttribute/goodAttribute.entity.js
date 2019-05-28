import { BaseEntity, Entity, Tree, PrimaryGeneratedColumn, Column, TreeChildren, TreeParent } from "typeorm";
import { isValid } from "../../helper/util";
import { decode } from "punycode";
import { formateID, decodeID } from "../../helper/id";

@Entity()
@Tree('closure-table')
export class GoodAttribute extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  
  @Column({
    type: 'character varying',
    name: 'attr_value'
  })
  attrValue

  @TreeChildren()
  specs;
  
  @TreeParent()
  parent;

  static createAttribute({ attrValue, parentId }) {
    const currenAttribute = Attribute.create({
      attrValue,
    })

    if (isValid(parentId)) {
      currenAttribute.parent = Attribute.create({
        id: decodeID(parentId)
      })
    }

    return currenAttribute.save().then(({ id }) => ({
      id: formateID('attribute', id),
      status: true
    }))
  }
  
}


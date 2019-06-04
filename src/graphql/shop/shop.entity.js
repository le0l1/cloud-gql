import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Index,
  ManyToOne
} from "typeorm";
import {
  isValid,
  mergeIfValid,
  handleSuccessResult,
  isEmpty
} from "../../helper/util";
import { Category } from "../category/category.entity";
import { decodeID, formateID, decodeNumberId } from "../../helper/id";
import { Banner } from "../banner/banner.entity";
import { Comment } from "../comment/comment.entity";
import {
  where,
  getQB,
  pipe,
  getMany,
  getManyAndCount,
  withPagination
} from "../../helper/database/sql";
import { ShopPhone } from "./shopPhone.entity";
import { buildSchemaFromTypeDefinitions } from "graphql-tools";

const transform = type => arr =>
  arr.map(a => {
    return type.create({
      id: decodeNumberId(a)
    });
  });

const getCategories = transform(Category);
const getBanners = transform(Banner);
@Entity()
export class Shop extends BaseEntity {
  @Index()
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", comment: "商户名称", nullable: true })
  name;

  @Column({ type: "character varying", comment: "商户qq", nullable: true })
  qqchat;

  @Column({ type: "character varying", comment: "商户微信", nullable: true })
  wechat;

  @Column({ type: "text", comment: "商户描述", nullable: true })
  description;

  @Column({ type: "integer", comment: "商户从属" })
  belongto;

  @Column({
    type: "integer",
    comment: "商户状态 1: 正常, 2: 暂停营业",
    default: 1
  })
  status;

  @Column({
    type: "character varying",
    nullable: true
  })
  cover;

  @CreateDateColumn()
  createdAt;

  @Column({ type: "boolean", default: false, comment: "商户审核状态" })
  is_passed;

  @Column({
    type: "character varying",
    comment: "商户所在地区",
    nullable: true
  })
  area;

  @Column({
    type: "character varying",
    comment: "商户所在城市",
    nullable: true
  })
  city;

  @Column({
    type: "timestamp",
    nullable: true
  })
  deletedAt;

  @Column({
    type: "character varying",
    comment: "商户详细地址",
    nullable: true
  })
  address;

  @ManyToMany(type => Category, category => category.shops)
  @JoinTable()
  coreBusiness;

  @OneToMany(type => Comment, comment => comment.shop)
  shopComments;

  static async createShop({
    belongto,
    coreBusiness = [],
    shopBanners = [],
    phones = [],
    ...rest
  }) {
    // check name unique
    rest.name && (await this.checkNameUnique(rest.name));
    
    return Shop.create({
      belongto: decodeID(belongto),
      coreBusiness: getCategories(coreBusiness),
      phones: phones.map(ShopPhone.create),
      cover: shopBanners[0] ? shopBanners[0] : null,
      ...rest
    })
      .save()
      .then(({ id }) => {
        Banner.createBannerArr("shop", id, shopBanners);
        return handleSuccessResult("shop", id);
      });
  }

  static deleteShop({ id }) {
    return Shop.update(id, {
      deletedAt: new Datate()
    }).then(() => ({
      id,
      status: true
    }));
  }

  static searchShopList({
    tsQuery,
    filter = { status: null },
    limit = 10,
    offset = 0,
    isPassed
  }) {
    const queryBuilder = Shop.createQueryBuilder("shop");

    const withRelation = query => {
      return query
        .leftJoinAndSelect("shop.coreBusiness", "category")
        .leftJoinAndMapMany(
          "shop.phone",
          ShopPhone,
          "shopPhone",
          "shopPhone.shopId = shop.id"
        );
    };

    return pipe(
      getQB("shop"),
      where("(shop.name like :tsQuery or shop.phone like :tsQuery)", {
        tsQuery: tsQuery ? `%${tsQuery}%` : null
      }),
      where("shop.status = :status", { status: filter.status }),
      where("shop.is_passed = :isPassed", { isPassed }),
      where("deletedAt is :deletedAt", { deletedAt: null }),
      withRelation,
      withPagination(limit, offset),
      getManyAndCount
    )(Shop);
  }

  static searchShop({ id }) {
    return Shop.findOne({
      where: {
        id: decodeID(id)
      },
      relations: ["coreBusiness"]
    }).then(res => ({
      ...res,
      id
    }));
  }

  static async updateShop({ id, phone, ...payload }) {
    payload.name && (await this.checkNameUnique(payload.name));

    const setIfValid = (key, fomate) => payload => {
      return payload[key]
        ? {
            ...payload,
            [key]: fomate(payload[key])
          }
        : payload;
    };

    // update phone
    if (phone.length) {
      ShopPhone.savePhone(phone, decodeNumberId(id));
    }

    const setCover = res => {
      return res.shopBanners
        ? {
            ...res,
            cover: res.shopBanners[0] || null
          }
        : res;
    };

    const successCb = () => ({
      id,
      status: true
    });

    const updatePayload = pipe(
      setIfValid("coreBusiness", getCategories),
      setIfValid("shopBanners", getBanners),
      setCover,
      mergeIfValid.bind(null, {})
    )(payload);
    // if updatePayload is not empty
    !isEmpty(updatePayload) &&
      (await Shop.update({ id: decodeNumberId(id) }, updatePayload));

    return {
      id,
      status: true
    };
  }

  static async checkNameUnique(name) {
    const findedShop = await Shop.findOne({
      where: {
        name: name
      }
    });
    if (findedShop) throw new Error("该店铺名已被使用");
  }
}

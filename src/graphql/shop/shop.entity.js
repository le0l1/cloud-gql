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
import { Image } from "../image/image.entity";

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

  @Column({
    type: "boolean",
    default: false,
    name: "is_passed",
    comment: "商户审核状态"
  })
  isPassed;

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
    shopImages = [],
    phones = [],
    ...rest
  }) {
    // check name unique
    rest.name && (await this.checkNameUnique(rest.name));

    return Shop.create({
      belongto: decodeID(belongto),
      coreBusiness: getCategories(coreBusiness),
      cover: shopBanners[0] ? shopBanners[0] : null,
      ...rest
    })
      .save()
      .then(({ id }) => {
        Banner.createBannerArr("shop", id, shopBanners);
        Image.createImageArr("shop", id, shopImages);
        ShopPhone.savePhone(phones, id);
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
          "shop.phones",
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
      where("shop.isPassed = :isPassed", { isPassed }),
      where("deletedAt is :deletedAt", { deletedAt: null }),
      withRelation,
      withPagination(limit, offset),
      getManyAndCount
    )(Shop);
  }

  static searchShop({ id, user }) {
    const qb = Shop.createQueryBuilder("shop")
      .leftJoinAndSelect("shop.coreBusiness", "category")
      .leftJoinAndMapMany(
        "shop.phones",
        ShopPhone,
        "shopPhone",
        "shopPhone.shopId = shop.id"
      )
      .leftJoinAndMapMany(
        "shop.shopBanners",
        Banner,
        "banner",
        "banner.bannerType = 'shop' and banner.bannerTypeId = shop.id"
      )
      .leftJoinAndMapMany(
        "shop.shopImages",
        Image,
        "image",
        "image.imageType = 'shop' and image.imageTypeId = shop.id"
      );
    if (id) {
      return qb.andWhere("shop.id = :id ", { id: decodeNumberId(id) }).getOne();
    }
    if (user)
      return qb
        .andWhere("shop.belongto = :user", {
          user: decodeNumberId(user)
        })
        .getOne();
  }

  static async updateShop({ id, coreBusiness = [],...payload }) {
    payload.name && (await this.checkNameUnique(id, payload.name));
    const realId = decodeNumberId(id);

    const exteralRelationSave = (key, save) => {
      if (payload[key]) {
        save(payload[key]);
        delete payload[key];
      }
    };

    if (payload.coreBusiness.length) {
      payload.coreBusiness = getCategories(coreBusiness);
    }
    exteralRelationSave("phones", phones =>
      ShopPhone.savePhone(phones, realId)
    );
    exteralRelationSave("shopBanners", shopBanners => {
      Banner.createBannerArr("shop", realId, shopBanners);
      payload.cover = payload.shopBanners[0] || null;
    });
    exteralRelationSave("shopImages", shopImages => {
      Image.createImageArr("shop", realId, shopImages);
    });

    return Shop.update({ id: realId }, payload).then(() => ({
      id,
      status: true
    }));
  }

  static async checkNameUnique(id, name) {
    const findedShop = await Shop.createQueryBuilder("shop")
      .where("id <> :id and name = :name")
      .setParameters({
        id: decodeNumberId(id),
        name
      })
      .getOne();

    if (findedShop) throw new Error("该店铺名已被使用");
  }
}

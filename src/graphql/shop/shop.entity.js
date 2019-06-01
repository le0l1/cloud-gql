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
import { isValid, mergeIfValid, handleSuccessResult } from "../../helper/util";
import { Category } from "../category/category.entity";
import { decodeID, formateID } from "../../helper/id";
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

const transform = type => arr =>
  arr.map(a => {
    const cate = type.create();
    cate.id = decodeID(a);
    return cate;
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

  @Column({ type: "character varying", comment: "商户手机号", nullable: true })
  phone;

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

  static createShop({
    belongto,
    coreBusiness = [],
    shopBanners = [],
    ...rest
  }) {
    return Shop.create({
      belongto: decodeID(belongto),
      coreBusiness: getCategories(coreBusiness),
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
    const formateResID = async query => {
      const res = await query;
      return res.map(a => ({
        ...a
      }));
    };

    const withRelation = query => {
      return query.leftJoinAndSelect("shop.coreBusiness", "category");
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

  static async updateShop({ id, ...payload }) {
    const updatePayload = payload;
    if (updatePayload.coreBusiness) {
      updatePayload.coreBusiness = getCategories(updatePayload.coreBusiness);
    }
    if (updatePayload.shopBanners) {
      updatePayload.shopBanners = getBanners(updatePayload.shopBanners);
    }
    const currentShop = await Shop.findOne(decodeID(id));

    await mergeIfValid(updatePayload, currentShop).save();

    return {
      id,
      status: true
    };
  }
}

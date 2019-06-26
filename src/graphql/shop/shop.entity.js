import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Index, In, IsNull, OneToOne,
} from 'typeorm'
import {
  handleSuccessResult,
} from '../../helper/util'
import { Category } from '../category/category.entity'
import { decodeNumberId } from '../../helper/util'
import { Banner } from '../banner/banner.entity'
import { Comment } from '../comment/comment.entity'
import {
  where,
  getQB,
  pipe,
  getManyAndCount,
  withPagination
} from '../../helper/sql'
import { Phone } from '../phone/phone.entity'
import { Image } from '../image/image.entity'

const transform = type => arr =>
  arr.map(a => {
    return type.create({
      id: decodeNumberId(a)
    })
  })

const getCategories = transform(Category)

@Entity()
export class Shop extends BaseEntity {
  @Index()
  @PrimaryGeneratedColumn()
  id

  @Column({ type: 'character varying', comment: '商户名称', nullable: true })
  name

  @Column({ type: 'character varying', comment: '商户qq', nullable: true })
  qqchat

  @Column({ type: 'character varying', comment: '商户微信', nullable: true })
  wechat

  @Column({ type: 'text', comment: '商户描述', nullable: true })
  description

  @Column({ type: 'integer', comment: '商户从属' })
  belongto

  @Column({
    type: 'integer',
    comment: '商户状态 1: 正常, 2: 暂停营业',
    default: 1
  })
  status

  @Column({
    type: 'character varying',
    nullable: true
  })
  cover

  @CreateDateColumn()
  createdAt

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_passed',
    comment: '商户审核状态'
  })
  isPassed

  @Column({
    type: 'character varying',
    comment: '商户所在地区',
    nullable: true
  })
  area

  @Column({
    type: 'character varying',
    comment: '商户所在城市',
    nullable: true
  })
  city

  @Column({
    type: 'timestamp',
    nullable: true
  })
  deletedAt

  @Column({
    type: 'character varying',
    comment: '商户详细地址',
    nullable: true
  })
  address

  @Column({
    type: 'character varying',
    comment: '商户联系方式 冗余字段',
    nullable: true
  })
  phone

  @ManyToMany(type => Category, category => category.shops)
  @JoinTable()
  categories

  @OneToMany(type => Comment, comment => comment.shop)
  shopComments

  static async createShop (params) {
    params.name && (await this.checkNameUnique(params.name))
    try {
      const id = await Shop.createorUpdateShop(params)
      return handleSuccessResult('shop', id)
    } catch (e) {
      return {
        status: false
      }
    }
  }

  static async createorUpdateShop ({
                                     belongto,
                                     categories = [],
                                     shopBanners = [],
                                     shopImages = [],
                                     phones = [],
                                     ...rest
                                   }) {
    const { id } = await Shop.create({
      belongto: decodeNumberId(belongto),
      categories: getCategories(categories),
      cover: shopBanners[0] ? shopBanners[0] : null,
      phone: phones[0] ? phones[0] : null,
      ...rest
    }).save();
    await Banner.createBannerArr('shop', id, shopBanners)
    await Image.createImageArr('shop', id, shopImages)
    await Phone.savePhone(phones, id)
    return id;
  }

  static deleteShop ({ id }) {
    return Shop.update(id, {
      deletedAt: new Datate()
    }).then(() => ({
      id,
      status: true
    }))
  }

  static searchShopList ({
                           tsQuery,
                           filter = { status: null },
                           limit = 10,
                           offset = 1,
                           categoryId,
                           isPassed
                         }) {

    const withRelation = query => {
      return query
        .leftJoinAndSelect('shop.categories',
          'category',
        )
    }

    return pipe(
      getQB('shop'),
      where('(shop.name like :tsQuery)', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null
      }),
      where('shop.status = :status', { status: filter.status }),
      where('shop.isPassed = :isPassed', { isPassed }),
      where('category.id = :categoryId', { categoryId: categoryId ? decodeNumberId(categoryId) : null }),
      where('deletedAt is :deletedAt', { deletedAt: null }),
      withRelation,
      withPagination(limit, offset - 1),
      getManyAndCount
    )(Shop)
  }

  static searchShop ({ id, user }) {
    const qb = Shop.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.categories', 'category')
      .leftJoinAndMapMany(
        'shop.shopBanners',
        Banner,
        'banner',
        'banner.bannerType = \'shop\' and banner.bannerTypeId = shop.id'
      )
      .leftJoinAndMapMany(
        'shop.shopImages',
        Image,
        'image',
        'image.imageType = \'shop\' and image.imageTypeId = shop.id'
      )
    if (id) {
      return qb.andWhere('shop.id = :id ', { id: decodeNumberId(id) }).getOne()
    }

    if (user)
      return qb
        .andWhere('shop.belongto = :user', {
          user: decodeNumberId(user)
        })
        .getOne()
  }

  static async updateShop (params) {
    params.name && (await this.checkNameUnique(params.name, params.id))
    try {
      const id = await Shop.createorUpdateShop({
        ...params,
        id: decodeNumberId(params.id),
      })
      return handleSuccessResult('shop', id)
    } catch (e) {
      return {
        status: false
      }
    }
  }

  static async checkNameUnique (name, id = null) {
    const qb = Shop.createQueryBuilder('shop')
      .where('name = :name')
      .setParameters({
        name
      })

    if (id) {
      qb.andWhere('id <> :id').setParameters({
        id: decodeNumberId(id)
      })
    }

    const findedShop = await qb.getOne()

    if (findedShop) throw new Error('该店铺名已被使用')
  }

  static findByIds(shopIds) {
    return Shop.find({
      where: {
        id: In(shopIds),
        deletedAt: IsNull(),
      },
      relations: ['categories']
    })
  }
}

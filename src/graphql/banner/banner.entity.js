import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity, ManyToOne,
} from 'typeorm';
import {
  isValid, mergeIfValid, decodeNumberId, formateID, decodeIDAndType,
} from '../../helper/util';
import {Shop} from "../shop/shop.entity";
import {Good} from "../good/good.entity";

@Entity()
export class Banner extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'character varying', nullable: true, comment: '轮播图标题' })
  title;

  @Column({
    type: 'character varying',
    nullable: true,
    comment: '轮播图图片地址',
  })
  path;

  @Column({
    type: 'character varying',
    nullable: true,
    comment: '轮播图文案内容',
  })
  content;

  @Column({
    type: 'character varying',
    nullable: true,
    length: 10,
    comment: '轮播图标签',
  })
  tag;

  @Column({
    type: 'character varying',
    nullable: true,
    comment: '轮播图跳转链接',
  })
  link;

  @CreateDateColumn()
  createdAt;

  @Column({
    type: 'character varying',
    nullable: true,
    comment: '轮播图所属类型',
    name: 'banner_type',
  })
  bannerType;

  @Column({
    type: 'int',
    nullable: true,
    comment: '轮播图所属的类型的id',
    name: 'banner_type_id',
  })
  bannerTypeId;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt;

  @ManyToOne(type => Shop, shop => shop.banners)
  shop;

  @ManyToOne(type => Good)
  good;

  static createBanner({ bannerTypeId: typeId, ...rest }) {
    const currentBanner = Banner.create({ ...rest });
    if (isValid(typeId)) {
      const [bannerType, bannerTypeId] = decodeIDAndType(typeId);
      currentBanner.bannerType = bannerType;
      currentBanner.bannerTypeId = Number(bannerTypeId);
    }
    return currentBanner.save().then(({ id }) => ({
      id: formateID('banner', id),
      status: true,
    }));
  }

  static deleteBanner(id) {
    return Banner.delete({
      id: decodeNumberId(id),
    }).then(() => ({
      id,
      status: true,
    }));
  }

  static searchBanner({ tag, bannerTypeId: formatedId }) {
    const [bannerType, bannerTypeId] = decodeIDAndType(formatedId);
    return Banner.find({
      where: mergeIfValid({ tag, bannerType, bannerTypeId }, {}),
    });
  }

  static updateBanner({ id, ...rest }) {
    return Banner.update(
      {
        id: decodeNumberId(id),
      },
      { ...rest },
    ).then(() => ({
      id,
      status: true,
    }));
  }

  static createBannerArr(bannerType, bannerTypeId, bannerArr = []) {
    const transformBanner = node => ({
      path: node,
      bannerType,
      bannerTypeId,
    });
    // delete banner every time
    Banner.delete({
      bannerType,
      bannerTypeId,
    });

    Banner.save(bannerArr.map(transformBanner));
  }
}

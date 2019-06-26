import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { handleSuccessResult, decodeNumberId } from '../../helper/util';
import { User } from '../user/user.entity';
import { Banner } from '../banner/banner.entity';

@Entity()
export class RFQ extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    name: 'vehicle_series',
    nullable: true,
  })
  vehicleSeries;

  @Column({
    type: 'character varying',
    name: 'vehicle_model',
    nullable: true,
  })
  vehicleModel;

  @Column({
    type: 'text',
    nullable: true,
  })
  description;

  @Column({
    type: 'int',
    name: 'announcer_id',
  })
  announcerId;

  @CreateDateColumn({ name: 'announce_at' })
  announceAt;

  @Column({
    type: 'int',
    nullable: true,
  })
  accessoriesId;

  @Column({
    type: 'character varying',
    name: 'rfq_cover',
    nullable: true,
  })
  RFQCover;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt;

  static createRFQ({
    announcerId, accessoriesId, RFQImages, ...rest
  }) {
    const decodeIfValid = val => (val ? decodeNumberId(val) : null);
    return RFQ.create({
      announcerId: decodeIfValid(announcerId),
      accessoriesId: decodeIfValid(accessoriesId),
      RFQCover: RFQImages[0] ? RFQImages[0] : null,
      ...rest,
    })
      .save()
      .then(({ id }) => {
        Banner.createBannerArr('RFQ', id, RFQImages);
        return handleSuccessResult('RFQ', id);
      });
  }

  static searchRFQ({ limit = 10, offset = 0 }) {
    return RFQ.createQueryBuilder('RFQ')
      .leftJoinAndMapOne(
        'RFQ.announcer',
        User,
        'user',
        'user.id = RFQ.announcerId',
      )
      .where('RFQ.deletedAt is null')
      .take(limit)
      .skip(offset)
      .getManyAndCount()
      .then(res => res);
  }
}

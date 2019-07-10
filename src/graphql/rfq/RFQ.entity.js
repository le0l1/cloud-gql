import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
}

import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RedPacketRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
    nullable: true,
  })
  userId;

  @Column({
    type: 'int',
    name: 'red_packet_id',
  })
  redPacketId;

  @Column({
    type: 'int',
    name: 'total_fee',
  })
  totalFee;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt;
}

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
    type: 'numeric',
    name: 'total_fee',
  })
  totalFee;

  @Column({
    name: 'had_settled',
    type: 'boolean',
    default: false,
    comment: '是否已清算',
  })
  hadSettled

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt;
}

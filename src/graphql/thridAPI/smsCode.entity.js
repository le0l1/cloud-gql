import {
  BaseEntity, Entity, Column, PrimaryColumn,
} from 'typeorm';

@Entity()
export class SMSCode extends BaseEntity {
  @Column({
    type: 'int',
    name: 'sms_code',
  })
  smsCode;

  @PrimaryColumn({
    type: 'character varying',
  })
  phone;
}

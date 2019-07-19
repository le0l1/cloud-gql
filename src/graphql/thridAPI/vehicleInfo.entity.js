import {
  BaseEntity, Entity, Column, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class VehicleInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
  })
  vin;

  @Column({
    type: 'character varying',
    name: 'brand_name',
  })
  brandName;

  @Column({
    type: 'character varying',
    name: 'import_flag',
  })
  importFlag;

  @Column({
    type: 'character varying',
    name: 'family_name',
  })
  familyName;

  @Column({
    type: 'character varying',
    name: 'group_name',
  })
  groupName;

  @Column({
    type: 'character varying',
    name: 'group_code',
  })
  groupCode;

  @Column({
    type: 'character varying',
    name: 'vehicle_id',
  })
  vehicleId;

  @Column({
    type: 'character varying',
    name: 'vehicle_name',
  })
  vehicleName;

  @Column({
    type: 'character varying',
    name: 'standard_name',
  })
  standardName;

  @Column({
    type: 'character varying',
  })
  displacement;

  @Column({
    type: 'character varying',
    name: 'gearbox_type',
  })
  gearboxType;

  @Column({
    type: 'character varying',
    name: 'fuel_jet_type',
  })
  fuelJetType;

  @Column({
    type: 'character varying',
    name: 'engine_model',
  })
  engineModel;

  @Column({
    type: 'character varying',
    name: 'driven_type',
  })
  drivenType;

  @Column({
    type: 'character varying',
  })
  remark;

  @Column({
    type: 'character varying',
    name: 'has_config',
  })
  hasConfig;

  @Column({
    type: 'character varying',
    name: 'list_price',
  })
  listPrice;

  @Column({
    type: 'character varying',
    name: 'purchase_price',
  })
  purchasePrice;

  @Column({
    type: 'character varying',
  })
  seat;

  @Column({
    type: 'character varying',
    name: 'vehicle_size',
  })
  vehicleSize;

  @Column({
    type: 'character varying',
  })
  wheelbase;

  @Column({
    type: 'character varying',
    name: 'full_weight',
  })
  fullWeight;

  @Column({
    type: 'character varying',
  })
  power;

  @Column({
    type: 'character varying',
    name: 'effluent_standard',
  })
  effluentStandard;

  @Column({
    type: 'character varying',
    name: 'vehicle_color',
  })
  vehicleColor;

  @Column({
    type: 'character varying',
    name: 'upload_date',
  })
  uploadDate;

  @Column({
    type: 'character varying',
  })
  standardname2;

  @Column({
    type: 'character varying',
    name: 'veh_is_seri',
  })
  vehIsSeri;
}

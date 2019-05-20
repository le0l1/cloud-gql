BEGIN;
ALTER TABLE cloud_shop 
ADD area character varying,
ADD city character varying;
COMMENT ON COLUMN cloud_shop.core_business IS '商家所在地区';
COMMENT ON COLUMN cloud_shop.address IS '商家所在城市';
COMMIT;
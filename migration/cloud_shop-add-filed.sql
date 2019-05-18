BEGIN;
ALTER TABLE cloud_shop 
ADD core_business character varying,
ADD address character varying;
COMMENT ON COLUMN cloud_shop.core_business IS '主营业务';
COMMENT ON COLUMN cloud_shop.address IS '商家地址';
COMMIT;
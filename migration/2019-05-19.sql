BEGIN;
ALTER TABLE cloud_banner ADD link character varying;
COMMENT ON COLUMN cloud_banner.link IS 'banner 跳转链接';
COMMIT;

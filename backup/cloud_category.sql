-- Adminer 4.7.1 PostgreSQL dump

DROP TABLE IF EXISTS "cloud_category";
DROP SEQUENCE IF EXISTS cloud_category_id_seq;
CREATE SEQUENCE cloud_category_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 510 CACHE 1;

CREATE TABLE "public"."cloud_category" (
    "id" integer DEFAULT nextval('cloud_category_id_seq') NOT NULL,
    "name" character varying(20) NOT NULL,
    "status" integer NOT NULL,
    "tag" character varying(20) NOT NULL
) WITH (oids = false);

INSERT INTO "cloud_category" ("id", "name", "status", "tag") VALUES
(502,	'汽车',	2,	'A'),
(503,	'汽车',	2,	'A'),
(504,	'汽车',	2,	'A'),
(505,	'汽车',	2,	'A'),
(506,	'汽车',	2,	'A'),
(507,	'汽车',	2,	'A'),
(508,	'汽车',	1,	'A'),
(509,	'汽车12312313',	1,	'A'),
(510,	'汽车12312313',	1,	'B');

-- 2019-05-06 14:25:33.825077+00

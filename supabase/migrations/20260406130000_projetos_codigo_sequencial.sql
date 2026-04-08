-- Adiciona um identificador sequencial humano-amigável para cada projeto do SIGPLAN.
-- O ID interno (uuid/integer "id") continua sendo a chave primária; este é apenas
-- um número exibido na UI (cards e página do projeto).

-- 1) Coluna
ALTER TABLE "public"."projetos"
  ADD COLUMN IF NOT EXISTS "codigo_sequencial" integer;

-- 2) Sequência dedicada
CREATE SEQUENCE IF NOT EXISTS "public"."projetos_codigo_sequencial_seq";

-- 3) Backfill: numera os projetos existentes em ordem de criação
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS rn
  FROM "public"."projetos"
  WHERE codigo_sequencial IS NULL
)
UPDATE "public"."projetos" p
   SET codigo_sequencial = ordered.rn
  FROM ordered
 WHERE p.id = ordered.id;

-- 4) Avança a sequência para o próximo valor disponível
SELECT setval(
  'public.projetos_codigo_sequencial_seq',
  COALESCE((SELECT MAX(codigo_sequencial) FROM "public"."projetos"), 0) + 1,
  false
);

-- 5) Default + NOT NULL + unique
ALTER TABLE "public"."projetos"
  ALTER COLUMN "codigo_sequencial" SET DEFAULT nextval('public.projetos_codigo_sequencial_seq');

ALTER TABLE "public"."projetos"
  ALTER COLUMN "codigo_sequencial" SET NOT NULL;

ALTER SEQUENCE "public"."projetos_codigo_sequencial_seq"
  OWNED BY "public"."projetos"."codigo_sequencial";

CREATE UNIQUE INDEX IF NOT EXISTS "projetos_codigo_sequencial_key"
  ON "public"."projetos" ("codigo_sequencial");

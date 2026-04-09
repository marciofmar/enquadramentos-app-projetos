-- Área "Resultados e Produtos" para entregas e atividades.
-- Cada entidade ganha um campo descritivo (texto livre) e um anexo PDF
-- opcional (máx. 4 MB) guardado em um bucket privado no Supabase Storage.
-- O acesso real é mediado por rotas internas (/api/resultados/*) para
-- permitir a troca do backend de storage no futuro (migração para
-- hospedagem institucional) sem impacto no banco nem nas URLs expostas.

-- 1) Colunas em entregas
ALTER TABLE "public"."entregas"
  ADD COLUMN IF NOT EXISTS "resultado_descricao" text,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_path" text,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_nome" text,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_tamanho" integer,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_enviado_em" timestamptz;

-- 2) Colunas em atividades
ALTER TABLE "public"."atividades"
  ADD COLUMN IF NOT EXISTS "resultado_descricao" text,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_path" text,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_nome" text,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_tamanho" integer,
  ADD COLUMN IF NOT EXISTS "resultado_arquivo_enviado_em" timestamptz;

-- 3) Bucket privado dedicado (idempotente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resultados', 'resultados', false, 4194304, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      public = EXCLUDED.public;

-- 4) RLS do bucket — controle grosso (apenas autenticado). A autorização
--    granular é feita nas rotas /api/resultados/* usando as mesmas regras
--    já aplicadas às entregas/atividades.
DROP POLICY IF EXISTS "resultados_auth_read" ON storage.objects;
CREATE POLICY "resultados_auth_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resultados');

DROP POLICY IF EXISTS "resultados_auth_write" ON storage.objects;
CREATE POLICY "resultados_auth_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resultados');

DROP POLICY IF EXISTS "resultados_auth_update" ON storage.objects;
CREATE POLICY "resultados_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resultados');

DROP POLICY IF EXISTS "resultados_auth_delete" ON storage.objects;
CREATE POLICY "resultados_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resultados');

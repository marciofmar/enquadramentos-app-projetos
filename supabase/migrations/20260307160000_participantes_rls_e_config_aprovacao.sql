-- ============================================================
-- RLS policies para entrega_participantes e atividade_participantes
-- Permite SELECT para todos autenticados, INSERT/UPDATE/DELETE para admin, master e gestor
-- Remove políticas antigas que restringiam gestores apenas ao setor líder
-- ============================================================

-- ENTREGA_PARTICIPANTES
ALTER TABLE IF EXISTS public.entrega_participantes ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas
DROP POLICY IF EXISTS ep_admin ON public.entrega_participantes;
DROP POLICY IF EXISTS ep_gestor ON public.entrega_participantes;
DROP POLICY IF EXISTS ep_select ON public.entrega_participantes;

-- SELECT para todos autenticados
DROP POLICY IF EXISTS "entrega_part_select_auth" ON public.entrega_participantes;
CREATE POLICY "entrega_part_select_auth"
  ON public.entrega_participantes
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT para admin, master e gestor
DROP POLICY IF EXISTS "entrega_part_insert_auth" ON public.entrega_participantes;
CREATE POLICY "entrega_part_insert_auth"
  ON public.entrega_participantes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master', 'gestor')
    )
  );

-- UPDATE para admin, master e gestor
DROP POLICY IF EXISTS "entrega_part_update_auth" ON public.entrega_participantes;
CREATE POLICY "entrega_part_update_auth"
  ON public.entrega_participantes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master', 'gestor')
    )
  );

-- DELETE para admin, master e gestor
DROP POLICY IF EXISTS "entrega_part_delete_auth" ON public.entrega_participantes;
CREATE POLICY "entrega_part_delete_auth"
  ON public.entrega_participantes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master', 'gestor')
    )
  );

-- ATIVIDADE_PARTICIPANTES
ALTER TABLE IF EXISTS public.atividade_participantes ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas
DROP POLICY IF EXISTS ap_admin ON public.atividade_participantes;
DROP POLICY IF EXISTS ap_gestor ON public.atividade_participantes;
DROP POLICY IF EXISTS ap_select ON public.atividade_participantes;

-- SELECT para todos autenticados
DROP POLICY IF EXISTS "atividade_part_select_auth" ON public.atividade_participantes;
CREATE POLICY "atividade_part_select_auth"
  ON public.atividade_participantes
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT para admin, master e gestor
DROP POLICY IF EXISTS "atividade_part_insert_auth" ON public.atividade_participantes;
CREATE POLICY "atividade_part_insert_auth"
  ON public.atividade_participantes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master', 'gestor')
    )
  );

-- UPDATE para admin, master e gestor
DROP POLICY IF EXISTS "atividade_part_update_auth" ON public.atividade_participantes;
CREATE POLICY "atividade_part_update_auth"
  ON public.atividade_participantes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master', 'gestor')
    )
  );

-- DELETE para admin, master e gestor
DROP POLICY IF EXISTS "atividade_part_delete_auth" ON public.atividade_participantes;
CREATE POLICY "atividade_part_delete_auth"
  ON public.atividade_participantes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master', 'gestor')
    )
  );

-- ============================================================
-- Configuração para permitir edições/exclusões sem aprovação
-- ============================================================

-- Permitir INSERT na tabela configuracoes para admin/master (necessário para upsert)
DROP POLICY IF EXISTS "config_insert_admin" ON public.configuracoes;
CREATE POLICY "config_insert_admin"
  ON public.configuracoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master')
    )
  );

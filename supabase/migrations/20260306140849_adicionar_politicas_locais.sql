-- ============================================================
-- 13_admin_insert_delete_conteudo.sql
-- Permite que admin insira e delete registros em:
-- panoramico_linhas, panoramico_setores, fichas, ficha_setores
-- ============================================================

-- PANORAMICO_LINHAS: INSERT + DELETE para admin
CREATE POLICY "pan_insert_admin"
  ON public.panoramico_linhas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "pan_delete_admin"
  ON public.panoramico_linhas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- PANORAMICO_SETORES: INSERT + DELETE para admin
CREATE POLICY "pan_setores_insert_admin"
  ON public.panoramico_setores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "pan_setores_delete_admin"
  ON public.panoramico_setores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- FICHAS: INSERT + DELETE para admin
CREATE POLICY "fichas_insert_admin"
  ON public.fichas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "fichas_delete_admin"
  ON public.fichas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- FICHA_SETORES: INSERT + DELETE para admin
CREATE POLICY "ficha_setores_insert_admin"
  ON public.ficha_setores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "ficha_setores_delete_admin"
  ON public.ficha_setores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- UPDATE policy para ficha_setores (faltava)
CREATE POLICY "ficha_setores_update_admin"
  ON public.ficha_setores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- UPDATE policy para panoramico_setores (faltava)
CREATE POLICY "pan_setores_update_admin"
  ON public.panoramico_setores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fase 3: Perfil Master

-- Alterar constraint de role para incluir 'master'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'master', 'gestor', 'usuario'));

-- Atualizar políticas RLS para incluir master no módulo de projetos

-- Configuracoes
DROP POLICY IF EXISTS config_update_admin ON configuracoes;
CREATE POLICY config_update_admin ON configuracoes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Projetos
DROP POLICY IF EXISTS proj_admin ON projetos;
CREATE POLICY proj_admin ON projetos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Projeto_acoes
DROP POLICY IF EXISTS pa_admin ON projeto_acoes;
CREATE POLICY pa_admin ON projeto_acoes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Entregas
DROP POLICY IF EXISTS ent_admin ON entregas;
CREATE POLICY ent_admin ON entregas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Entrega_participantes
DROP POLICY IF EXISTS ep_admin ON entrega_participantes;
CREATE POLICY ep_admin ON entrega_participantes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Atividades
DROP POLICY IF EXISTS ativ_admin ON atividades;
CREATE POLICY ativ_admin ON atividades FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Atividade_participantes
DROP POLICY IF EXISTS ap_admin ON atividade_participantes;
CREATE POLICY ap_admin ON atividade_participantes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Audit_log
DROP POLICY IF EXISTS audit_admin ON audit_log;
CREATE POLICY audit_admin ON audit_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);
DROP POLICY IF EXISTS audit_select_admin ON audit_log;
CREATE POLICY audit_select_admin ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

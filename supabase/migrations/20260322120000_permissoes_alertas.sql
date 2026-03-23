-- Migração: Revisão de permissões + tabela de alertas + ajustes RLS
-- 1. Tabela de alertas para notificar responsáveis sobre edições/exclusões

CREATE TABLE IF NOT EXISTS alertas (
  id SERIAL PRIMARY KEY,
  destinatario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('edicao_entrega','exclusao_entrega','edicao_atividade','exclusao_atividade')),
  entidade TEXT NOT NULL CHECK (entidade IN ('entrega','atividade')),
  entidade_id INTEGER NOT NULL,
  entidade_nome TEXT,
  projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
  projeto_nome TEXT,
  autor_id UUID REFERENCES profiles(id),
  autor_nome TEXT,
  descricao TEXT,
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alertas_dest ON alertas (destinatario_id, lido);

ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS alerta_select ON alertas;
CREATE POLICY alerta_select ON alertas FOR SELECT TO authenticated
  USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS alerta_update ON alertas;
CREATE POLICY alerta_update ON alertas FOR UPDATE TO authenticated
  USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS alerta_insert ON alertas;
CREATE POLICY alerta_insert ON alertas FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','master','gestor')));

-- 2. RLS observações — restringir insert a gestor, master e admin (usuario perde criação)
DROP POLICY IF EXISTS obs_insert ON observacoes;
CREATE POLICY obs_insert ON observacoes FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','master','gestor')
  ));

-- 3. RLS entregas — permitir UPDATE por gestor do órgão responsável pela entrega
DROP POLICY IF EXISTS ent_gestor_resp_update ON entregas;
CREATE POLICY ent_gestor_resp_update ON entregas FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'gestor'
    AND p.setor_id = orgao_responsavel_setor_id
  ));

-- 4. RLS atividades — permitir CRUD por gestor do órgão responsável da entrega
DROP POLICY IF EXISTS ativ_gestor_resp_entrega ON atividades;
CREATE POLICY ativ_gestor_resp_entrega ON atividades FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN entregas e ON e.id = atividades.entrega_id
    WHERE p.id = auth.uid() AND p.role = 'gestor'
    AND p.setor_id = e.orgao_responsavel_setor_id
  ));

-- 5. RLS atividades — permitir UPDATE pelo responsável individual da atividade
DROP POLICY IF EXISTS ativ_gestor_resp_atividade ON atividades;
CREATE POLICY ativ_gestor_resp_atividade ON atividades FOR UPDATE TO authenticated
  USING (responsavel_atividade_id = auth.uid() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gestor'
  ));

-- 6. RLS audit_log — permitir select por master também
DROP POLICY IF EXISTS audit_select_admin ON audit_log;
CREATE POLICY audit_select_admin ON audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','master')));

-- 7. RLS audit_log — permitir insert por master e admin também (além de gestor)
DROP POLICY IF EXISTS audit_gestor_insert ON audit_log;
DROP POLICY IF EXISTS audit_insert_auth ON audit_log;
CREATE POLICY audit_insert_auth ON audit_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','master','gestor')));

-- 8. Atualizar admin_create_user para aceitar parâmetro p_role (gestor ou usuario)
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email text, p_password text, p_nome text, p_setor_id integer, p_role text DEFAULT 'gestor'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  caller_role text;
  new_user_id uuid;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'master', 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão: apenas gestor, master ou admin pode criar usuários';
  END IF;

  -- Validar role permitido
  IF p_role NOT IN ('gestor', 'usuario') THEN
    RAISE EXCEPTION 'Role inválido: apenas gestor ou usuario são permitidos';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(trim(p_email))) THEN
    RAISE EXCEPTION 'Já existe um usuário com este email';
  END IF;

  new_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    created_at, updated_at
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000',
    lower(trim(p_email)), crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nome', p_nome, 'setor_id', p_setor_id),
    'authenticated', 'authenticated',
    '', '', '', '', now(), now()
  );

  UPDATE public.profiles
  SET role = p_role,
      senha_zerada = true,
      reset_token = p_password,
      nome = p_nome,
      setor_id = p_setor_id
  WHERE id = new_user_id;

  RETURN new_user_id;
END;
$$;

-- Função SECURITY DEFINER para criar usuário via PostgREST .rpc()
-- Contorna o bug do GoTrue que rejeita SERVICE_ROLE_KEY HS256.

CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email text,
  p_password text,
  p_nome text,
  p_setor_id integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  caller_role text;
  new_user_id uuid;
BEGIN
  -- Verificar que o caller é gestor, master ou admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'master', 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão: apenas gestor, master ou admin pode criar usuários';
  END IF;

  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(trim(p_email))) THEN
    RAISE EXCEPTION 'Já existe um usuário com este email';
  END IF;

  -- Gerar novo UUID
  new_user_id := gen_random_uuid();

  -- Inserir em auth.users
  -- IMPORTANTE: GoTrue exige que campos de token sejam '' (string vazia), não NULL.
  -- Se forem NULL, GoTrue falha com "Scan error on column: converting NULL to string"
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    lower(trim(p_email)),
    crypt(p_password, gen_salt('bf')),
    now(),  -- auto-confirmar email
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nome', p_nome, 'setor_id', p_setor_id),
    'authenticated',
    'authenticated',
    '',   -- confirmation_token: string vazia, não NULL
    '',   -- recovery_token: string vazia, não NULL
    '',   -- email_change_token_new: string vazia, não NULL
    '',   -- email_change: string vazia, não NULL
    now(),
    now()
  );

  -- O trigger handle_new_user() criará o profile automaticamente
  -- Mas como ele cria com role='solicitante', precisamos atualizar para 'gestor'
  UPDATE public.profiles
  SET role = 'gestor',
      senha_zerada = true,
      reset_token = p_password,
      nome = p_nome,
      setor_id = p_setor_id
  WHERE id = new_user_id;

  RETURN new_user_id;
END;
$$;

-- Inserir identity para o novo usuário (necessário para login)
CREATE OR REPLACE FUNCTION public.admin_create_user_identity(
  p_user_id uuid,
  p_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    jsonb_build_object('sub', p_user_id::text, 'email', lower(trim(p_email))),
    'email',
    p_user_id::text,
    now(),
    now(),
    now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_user_identity(uuid, text) TO authenticated;

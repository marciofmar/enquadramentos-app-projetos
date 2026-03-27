set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_create_user(p_email text, p_password text, p_nome text, p_setor_id integer, p_role text DEFAULT 'gestor'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_delete_setor(p_setor_id integer, p_transfer_to_id integer DEFAULT NULL::integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_deps json;
    v_total int;
    v_merged int := 0;
    v_tmp int;
BEGIN
    -- Contar dependencias (incluindo tipo 'usuario' em atividade_participantes)
    SELECT json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes_setor', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor'),
        'atividade_participantes_usuario', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'usuario'),
        'panoramico_setores', (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id),
        'ficha_setores', (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id),
        'total', (
            (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id) +
            (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id)
        )
    ) INTO v_deps;

    v_total := (v_deps->>'total')::int;

    IF p_transfer_to_id IS NOT NULL AND v_total > 0 THEN
        -- profiles e projetos: transferencia direta (sem unique constraints)
        UPDATE profiles SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE projetos SET setor_lider_id = p_transfer_to_id WHERE setor_lider_id = p_setor_id;

        -- entrega_participantes: tratar conflito de unique (entrega_id, setor_id)
        -- Primeiro remover duplicatas (onde o setor destino ja existe na mesma entrega)
        DELETE FROM entrega_participantes ep
        WHERE ep.setor_id = p_setor_id
          AND EXISTS (
            SELECT 1 FROM entrega_participantes ep2
            WHERE ep2.entrega_id = ep.entrega_id
              AND ep2.setor_id = p_transfer_to_id
              AND ep2.tipo_participante = ep.tipo_participante
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        -- Depois transferir os restantes
        UPDATE entrega_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;

        -- atividade_participantes tipo 'setor': tratar conflito de unique
        DELETE FROM atividade_participantes ap
        WHERE ap.setor_id = p_setor_id AND ap.tipo_participante = 'setor'
          AND EXISTS (
            SELECT 1 FROM atividade_participantes ap2
            WHERE ap2.atividade_id = ap.atividade_id
              AND ap2.setor_id = p_transfer_to_id
              AND ap2.tipo_participante = 'setor'
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id
          WHERE setor_id = p_setor_id AND tipo_participante = 'setor';

        -- atividade_participantes tipo 'usuario': transferir snapshot de setor
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id
          WHERE setor_id = p_setor_id AND tipo_participante = 'usuario';

        -- panoramico_setores: tratar duplicatas
        DELETE FROM panoramico_setores ps
        WHERE ps.setor_id = p_setor_id
          AND EXISTS (
            SELECT 1 FROM panoramico_setores ps2
            WHERE ps2.panoramico_linha_id = ps.panoramico_linha_id
              AND ps2.setor_id = p_transfer_to_id
              AND ps2.tipo_participacao = ps.tipo_participacao
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        UPDATE panoramico_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;

        -- ficha_setores: tratar duplicatas
        DELETE FROM ficha_setores fs
        WHERE fs.setor_id = p_setor_id
          AND EXISTS (
            SELECT 1 FROM ficha_setores fs2
            WHERE fs2.ficha_id = fs.ficha_id
              AND fs2.setor_id = p_transfer_to_id
              AND fs2.tipo_participacao = fs.tipo_participacao
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        UPDATE ficha_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
    END IF;

    IF v_total = 0 OR p_transfer_to_id IS NOT NULL THEN
        DELETE FROM setores WHERE id = p_setor_id;
        RETURN json_build_object('deleted', true, 'dependencies', v_deps, 'merged', v_merged);
    ELSE
        RETURN json_build_object('deleted', false, 'dependencies', v_deps, 'merged', 0);
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_setor_dependencies(p_setor_id integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes_setor', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor'),
        'atividade_participantes_usuario', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'usuario'),
        'panoramico_setores', (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id),
        'ficha_setores', (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id),
        'total', (
            (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id) +
            (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id)
        )
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome, setor_id, role, perfil_solicitado)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    (NEW.raw_user_meta_data->>'setor_id')::INTEGER,
    'solicitante',
    NEW.raw_user_meta_data->>'perfil_solicitado'
  );
  RETURN NEW;
END;
$function$
;



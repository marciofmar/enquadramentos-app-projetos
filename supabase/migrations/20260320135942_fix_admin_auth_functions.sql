CREATE OR REPLACE FUNCTION public.admin_update_user_email(
  target_user_id uuid,
  new_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Verificar que o caller é admin ou master
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR (caller_role != 'admin' AND caller_role != 'master') THEN
    RAISE EXCEPTION 'Sem permissão: apenas admin ou master pode executar esta função';
  END IF;

  -- Atualizar email no auth.users
  UPDATE auth.users
  SET email = new_email,
      updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
  END IF;

  -- Atualizar email no profiles também
  UPDATE public.profiles
  SET email = new_email
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Verificar que o caller é admin ou master
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR (caller_role != 'admin' AND caller_role != 'master') THEN
    RAISE EXCEPTION 'Sem permissão: apenas admin ou master pode excluir usuários';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_email(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_email(uuid, text) TO service_role;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO service_role;

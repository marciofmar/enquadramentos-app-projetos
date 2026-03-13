-- Migração: Funções admin via PostgreSQL (bypass GoTrue HS256/ES256 mismatch)
-- Estas funções operam diretamente em auth.users via SECURITY DEFINER,
-- contornando o bug do GoTrue que rejeita SERVICE_ROLE_KEY HS256.
-- Chamadas via PostgREST .rpc() que aceita HS256 sem problemas.

-- Garante que a extensão pgcrypto está disponível (necessária para crypt/gen_salt)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 1. Resetar senha de um usuário (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  target_user_id uuid,
  new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Verificar que o caller é admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão: apenas admin pode executar esta função';
  END IF;

  -- Atualizar senha no auth.users usando bcrypt
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
  END IF;
END;
$$;

-- ============================================================
-- 2. Atualizar email de um usuário (admin only)
-- ============================================================
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
  -- Verificar que o caller é admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão: apenas admin pode executar esta função';
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

-- ============================================================
-- 3. Confirmar email de um usuário (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(
  target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Esta função é chamada após signup quando email está desativado.
  -- Não verifica admin pois é chamada pelo sistema (API route com service role).
  UPDATE auth.users
  SET email_confirmed_at = now(),
      updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
  END IF;
END;
$$;

-- ============================================================
-- 4. Verificar senha de um usuário (para login-reset)
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_user_password(
  target_user_id uuid,
  password_attempt text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT encrypted_password INTO stored_hash
  FROM auth.users
  WHERE id = target_user_id;

  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN stored_hash = crypt(password_attempt, stored_hash);
END;
$$;

-- Permissões: funções acessíveis via PostgREST para roles autenticados e service_role
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) TO service_role;

GRANT EXECUTE ON FUNCTION public.admin_update_user_email(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_email(uuid, text) TO service_role;

GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(uuid) TO service_role;

GRANT EXECUTE ON FUNCTION public.verify_user_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_password(uuid, text) TO service_role;

-- Permitir que usuários com perfil 'master' também possam:
--  1. Atualizar a coluna `role` (e demais colunas) da tabela `profiles` (RLS)
--  2. Executar a função `admin_update_user_password` para zerar senha

-- 1) Recriar policy de UPDATE em profiles incluindo 'master'
DROP POLICY IF EXISTS "profiles_update_admin" ON "public"."profiles";

CREATE POLICY "profiles_update_admin" ON "public"."profiles"
  FOR UPDATE TO "authenticated"
  USING (EXISTS (
    SELECT 1 FROM "public"."profiles" "profiles_1"
    WHERE "profiles_1"."id" = "auth"."uid"()
      AND "profiles_1"."role" IN ('admin', 'master')
  ));

-- 2) Atualizar função admin_update_user_password para aceitar 'master'
CREATE OR REPLACE FUNCTION "public"."admin_update_user_password"("target_user_id" "uuid", "new_password" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
  caller_role text;
BEGIN
  -- Verificar que o caller é admin ou master
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR (caller_role <> 'admin' AND caller_role <> 'master') THEN
    RAISE EXCEPTION 'Sem permissão: apenas admin ou master pode executar esta função';
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

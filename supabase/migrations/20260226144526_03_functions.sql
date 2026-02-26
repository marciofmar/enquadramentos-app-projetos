set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_update_acao_campo(acao_numero text, campo text, novo_valor text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    caller_role TEXT;
BEGIN
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Permissão negada: apenas admin';
    END IF;
    
    EXECUTE format('UPDATE acoes_estrategicas SET %I = $1 WHERE numero = $2', campo)
    USING novo_valor, acao_numero;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_observacao(obs_id integer, novo_status text, resposta text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    caller_role TEXT;
BEGIN
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF caller_role != 'admin' AND caller_role != 'gestor' THEN
        RAISE EXCEPTION 'Permissão negada: apenas admin ou gestor';
    END IF;

    UPDATE observacoes
    SET status = novo_status,
        resposta_admin = resposta,
        respondido_por = auth.uid(),
        respondido_em = NOW()
    WHERE id = obs_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email, nome, setor_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        (NEW.raw_user_meta_data->>'setor_id')::INTEGER,
        'usuario'
    );
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;


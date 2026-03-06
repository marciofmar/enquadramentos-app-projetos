


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."admin_delete_setor"("p_setor_id" integer, "p_transfer_to_id" integer DEFAULT NULL::integer) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    caller_role TEXT;
    deps JSON;
    dep_total INTEGER;
BEGIN
    -- Verifica permissão
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Permissão negada: apenas admin';
    END IF;

    -- Verifica dependências
    deps := check_setor_dependencies(p_setor_id);
    dep_total := (deps->>'total')::INTEGER;

    -- Se há dependências e não informou setor de destino, bloqueia
    IF dep_total > 0 AND p_transfer_to_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'reason', 'has_dependencies',
            'dependencies', deps
        );
    END IF;

    -- Se há dependências e informou destino, transfere
    IF dep_total > 0 AND p_transfer_to_id IS NOT NULL THEN
        -- Valida que o setor destino existe e é diferente
        IF NOT EXISTS (SELECT 1 FROM setores WHERE id = p_transfer_to_id) THEN
            RAISE EXCEPTION 'Setor de destino não existe';
        END IF;
        IF p_transfer_to_id = p_setor_id THEN
            RAISE EXCEPTION 'Setor de destino deve ser diferente do setor sendo excluído';
        END IF;

        -- Transfere dependências
        UPDATE profiles SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE projetos SET setor_lider_id = p_transfer_to_id WHERE setor_lider_id = p_setor_id;
        UPDATE entrega_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE panoramico_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE ficha_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
    END IF;

    -- Exclui o setor
    DELETE FROM setores WHERE id = p_setor_id;

    RETURN json_build_object('success', true, 'transferred_to', p_transfer_to_id);
END;
$$;


ALTER FUNCTION "public"."admin_delete_setor"("p_setor_id" integer, "p_transfer_to_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_acao_campo"("acao_numero" "text", "campo" "text", "novo_valor" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
$_$;


ALTER FUNCTION "public"."admin_update_acao_campo"("acao_numero" "text", "campo" "text", "novo_valor" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_observacao"("obs_id" integer, "novo_status" "text", "resposta" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_update_observacao"("obs_id" integer, "novo_status" "text", "resposta" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_setor_dependencies"("p_setor_id" integer) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id),
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
    ) INTO result;
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."check_setor_dependencies"("p_setor_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."acoes_estrategicas" (
    "id" integer NOT NULL,
    "numero" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "eixo_prioritario_id" integer,
    "objetivo_estrategico_id" integer,
    "estrategia_id" integer,
    "acoes_conectadas" "text",
    "descricao_oficial_completa" "text",
    "descricao_o_que" "text",
    "descricao_para_que" "text",
    "ancoragem" "text",
    "nota_arranjo_institucional" "text",
    "versao" "text" DEFAULT '1.0'::"text",
    "data_elaboracao" "date",
    "elaboracao" "text" DEFAULT 'ICTDEC/DAEAD'::"text",
    "proxima_fase" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."acoes_estrategicas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."acoes_estrategicas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."acoes_estrategicas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."acoes_estrategicas_id_seq" OWNED BY "public"."acoes_estrategicas"."id";



CREATE TABLE IF NOT EXISTS "public"."atividade_participantes" (
    "id" integer NOT NULL,
    "atividade_id" integer NOT NULL,
    "setor_id" integer,
    "tipo_participante" "text" DEFAULT 'setor'::"text" NOT NULL,
    "papel" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "atividade_participantes_tipo_participante_check" CHECK (("tipo_participante" = ANY (ARRAY['setor'::"text", 'externo_subsegop'::"text", 'externo_sedec'::"text"])))
);


ALTER TABLE "public"."atividade_participantes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."atividade_participantes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."atividade_participantes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."atividade_participantes_id_seq" OWNED BY "public"."atividade_participantes"."id";



CREATE TABLE IF NOT EXISTS "public"."atividades" (
    "id" integer NOT NULL,
    "entrega_id" integer NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "data_prevista" "date",
    "status" "text" DEFAULT 'aberta'::"text" NOT NULL,
    "motivo_status" "text",
    CONSTRAINT "atividades_status_check" CHECK (("status" = ANY (ARRAY['aberta'::"text", 'em_andamento'::"text", 'aguardando'::"text", 'resolvida'::"text", 'cancelada'::"text"])))
);


ALTER TABLE "public"."atividades" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."atividades_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."atividades_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."atividades_id_seq" OWNED BY "public"."atividades"."id";



CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" integer NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "usuario_nome" "text",
    "tipo_acao" "text" NOT NULL,
    "entidade" "text" NOT NULL,
    "entidade_id" integer NOT NULL,
    "conteudo_anterior" "jsonb",
    "conteudo_novo" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_log_entidade_check" CHECK (("entidade" = ANY (ARRAY['projeto'::"text", 'entrega'::"text", 'atividade'::"text", 'entrega_participante'::"text", 'atividade_participante'::"text"]))),
    CONSTRAINT "audit_log_tipo_acao_check" CHECK (("tipo_acao" = ANY (ARRAY['create'::"text", 'update'::"text", 'delete'::"text"])))
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."audit_log_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."audit_log_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."audit_log_id_seq" OWNED BY "public"."audit_log"."id";



CREATE TABLE IF NOT EXISTS "public"."configuracoes" (
    "chave" "text" NOT NULL,
    "valor" "text" NOT NULL,
    "descricao" "text",
    "atualizado_por" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."configuracoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."destaque_linhas" (
    "id" integer NOT NULL,
    "destaque_id" integer NOT NULL,
    "ordem" integer NOT NULL,
    "tipo" "text" NOT NULL,
    "label" "text",
    "conteudo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "destaque_linhas_tipo_check" CHECK (("tipo" = ANY (ARRAY['label_conteudo'::"text", 'header'::"text"])))
);


ALTER TABLE "public"."destaque_linhas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."destaque_linhas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."destaque_linhas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."destaque_linhas_id_seq" OWNED BY "public"."destaque_linhas"."id";



CREATE TABLE IF NOT EXISTS "public"."destaques_estrategicos" (
    "id" integer NOT NULL,
    "acao_estrategica_id" integer NOT NULL,
    "titulo" "text" NOT NULL,
    "header_contexto" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."destaques_estrategicos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."destaques_estrategicos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."destaques_estrategicos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."destaques_estrategicos_id_seq" OWNED BY "public"."destaques_estrategicos"."id";



CREATE TABLE IF NOT EXISTS "public"."eixos_prioritarios" (
    "id" integer NOT NULL,
    "codigo" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."eixos_prioritarios" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."eixos_prioritarios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."eixos_prioritarios_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."eixos_prioritarios_id_seq" OWNED BY "public"."eixos_prioritarios"."id";



CREATE TABLE IF NOT EXISTS "public"."entrega_participantes" (
    "id" integer NOT NULL,
    "entrega_id" integer NOT NULL,
    "setor_id" integer,
    "tipo_participante" "text" DEFAULT 'setor'::"text" NOT NULL,
    "papel" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "entrega_participantes_tipo_participante_check" CHECK (("tipo_participante" = ANY (ARRAY['setor'::"text", 'externo_subsegop'::"text", 'externo_sedec'::"text"])))
);


ALTER TABLE "public"."entrega_participantes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."entrega_participantes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entrega_participantes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entrega_participantes_id_seq" OWNED BY "public"."entrega_participantes"."id";



CREATE TABLE IF NOT EXISTS "public"."entregas" (
    "id" integer NOT NULL,
    "projeto_id" integer NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text" NOT NULL,
    "dependencias_criticas" "text",
    "data_final_prevista" "date",
    "status" "text" DEFAULT 'aberta'::"text" NOT NULL,
    "motivo_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "entregas_status_check" CHECK (("status" = ANY (ARRAY['aberta'::"text", 'em_andamento'::"text", 'aguardando'::"text", 'resolvida'::"text", 'cancelada'::"text"])))
);


ALTER TABLE "public"."entregas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."entregas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entregas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entregas_id_seq" OWNED BY "public"."entregas"."id";



CREATE TABLE IF NOT EXISTS "public"."estrategias" (
    "id" integer NOT NULL,
    "codigo" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "objetivo_estrategico_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."estrategias" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."estrategias_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."estrategias_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."estrategias_id_seq" OWNED BY "public"."estrategias"."id";



CREATE TABLE IF NOT EXISTS "public"."ficha_setores" (
    "id" integer NOT NULL,
    "ficha_id" integer NOT NULL,
    "setor_id" integer NOT NULL,
    "tipo_participacao" "text" DEFAULT 'principal'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ficha_setores_tipo_participacao_check" CHECK (("tipo_participacao" = ANY (ARRAY['principal'::"text", 'participante'::"text", 'aval'::"text", 'coordenador'::"text", 'superior'::"text", 'destaque'::"text"])))
);


ALTER TABLE "public"."ficha_setores" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ficha_setores_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."ficha_setores_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ficha_setores_id_seq" OWNED BY "public"."ficha_setores"."id";



CREATE TABLE IF NOT EXISTS "public"."fichas" (
    "id" integer NOT NULL,
    "acao_estrategica_id" integer NOT NULL,
    "ordem" integer NOT NULL,
    "titulo" "text" NOT NULL,
    "setor_display" "text" NOT NULL,
    "papel" "text" NOT NULL,
    "justificativa" "text" NOT NULL,
    "contribuicao_esperada" "text"[] NOT NULL,
    "nao_escopo" "text"[] NOT NULL,
    "dependencias_criticas" "text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fichas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."fichas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fichas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fichas_id_seq" OWNED BY "public"."fichas"."id";



CREATE TABLE IF NOT EXISTS "public"."fundamentacao_itens" (
    "id" integer NOT NULL,
    "fundamentacao_id" integer NOT NULL,
    "ordem" integer NOT NULL,
    "conteudo" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fundamentacao_itens" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."fundamentacao_itens_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fundamentacao_itens_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fundamentacao_itens_id_seq" OWNED BY "public"."fundamentacao_itens"."id";



CREATE TABLE IF NOT EXISTS "public"."fundamentacoes" (
    "id" integer NOT NULL,
    "acao_estrategica_id" integer NOT NULL,
    "introducao" "text",
    "conclusao" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fundamentacoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."fundamentacoes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fundamentacoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fundamentacoes_id_seq" OWNED BY "public"."fundamentacoes"."id";



CREATE TABLE IF NOT EXISTS "public"."objetivos_estrategicos" (
    "id" integer NOT NULL,
    "codigo" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."objetivos_estrategicos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."objetivos_estrategicos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."objetivos_estrategicos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."objetivos_estrategicos_id_seq" OWNED BY "public"."objetivos_estrategicos"."id";



CREATE TABLE IF NOT EXISTS "public"."observacoes" (
    "id" integer NOT NULL,
    "acao_estrategica_id" integer NOT NULL,
    "bloco" "text" NOT NULL,
    "conteudo" "text" NOT NULL,
    "autor_id" "uuid" NOT NULL,
    "autor_nome" "text" NOT NULL,
    "autor_setor" "text",
    "status" "text" DEFAULT 'em_analise'::"text" NOT NULL,
    "resposta_admin" "text",
    "respondido_por" "uuid",
    "respondido_em" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "observacoes_bloco_check" CHECK (("bloco" = ANY (ARRAY['descricao'::"text", 'ancoragem'::"text", 'destaque'::"text", 'panoramico'::"text", 'fichas'::"text", 'fundamentacao'::"text", 'nota_institucional'::"text"]))),
    CONSTRAINT "observacoes_status_check" CHECK (("status" = ANY (ARRAY['em_analise'::"text", 'absorvida'::"text", 'indeferida'::"text"])))
);


ALTER TABLE "public"."observacoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."observacoes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."observacoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."observacoes_id_seq" OWNED BY "public"."observacoes"."id";



CREATE TABLE IF NOT EXISTS "public"."panoramico_linhas" (
    "id" integer NOT NULL,
    "acao_estrategica_id" integer NOT NULL,
    "ordem" integer NOT NULL,
    "setor_display" "text" NOT NULL,
    "papel" "text" NOT NULL,
    "sintese_contribuicao" "text",
    "nao_faz" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."panoramico_linhas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."panoramico_linhas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."panoramico_linhas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."panoramico_linhas_id_seq" OWNED BY "public"."panoramico_linhas"."id";



CREATE TABLE IF NOT EXISTS "public"."panoramico_setores" (
    "id" integer NOT NULL,
    "panoramico_linha_id" integer NOT NULL,
    "setor_id" integer NOT NULL,
    "tipo_participacao" "text" DEFAULT 'principal'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "panoramico_setores_tipo_participacao_check" CHECK (("tipo_participacao" = ANY (ARRAY['principal'::"text", 'participante'::"text", 'aval'::"text", 'coordenador'::"text", 'superior'::"text", 'destaque'::"text"])))
);


ALTER TABLE "public"."panoramico_setores" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."panoramico_setores_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."panoramico_setores_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."panoramico_setores_id_seq" OWNED BY "public"."panoramico_setores"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "setor_id" integer,
    "role" "text" DEFAULT 'usuario'::"text" NOT NULL,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'gestor'::"text", 'usuario'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projeto_acoes" (
    "id" integer NOT NULL,
    "projeto_id" integer NOT NULL,
    "acao_estrategica_id" integer NOT NULL
);


ALTER TABLE "public"."projeto_acoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projeto_acoes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projeto_acoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projeto_acoes_id_seq" OWNED BY "public"."projeto_acoes"."id";



CREATE TABLE IF NOT EXISTS "public"."projetos" (
    "id" integer NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text" NOT NULL,
    "problema_resolve" "text" NOT NULL,
    "setor_lider_id" integer NOT NULL,
    "criado_por" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."projetos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projetos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projetos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projetos_id_seq" OWNED BY "public"."projetos"."id";



CREATE TABLE IF NOT EXISTS "public"."setores" (
    "id" integer NOT NULL,
    "codigo" "text" NOT NULL,
    "nome_completo" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."setores" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."setores_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."setores_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."setores_id_seq" OWNED BY "public"."setores"."id";



CREATE OR REPLACE VIEW "public"."v_observacoes" AS
 SELECT "o"."id",
    "o"."acao_estrategica_id",
    "ae"."numero" AS "acao_numero",
    "o"."bloco",
    "o"."conteudo",
    "o"."autor_nome",
    "o"."autor_setor",
    "o"."status",
    "o"."resposta_admin",
    "o"."created_at",
    "o"."respondido_em",
    "p_resp"."nome" AS "respondido_por_nome"
   FROM (("public"."observacoes" "o"
     JOIN "public"."acoes_estrategicas" "ae" ON (("ae"."id" = "o"."acao_estrategica_id")))
     LEFT JOIN "public"."profiles" "p_resp" ON (("p_resp"."id" = "o"."respondido_por")))
  ORDER BY "o"."created_at" DESC;


ALTER VIEW "public"."v_observacoes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_panoramico_completo" AS
 SELECT "ae"."numero" AS "acao_numero",
    "pl"."ordem",
    "pl"."setor_display",
    "pl"."papel",
    "pl"."sintese_contribuicao",
    "pl"."nao_faz",
    "s"."codigo" AS "setor_atomico",
    "ps"."tipo_participacao"
   FROM ((("public"."panoramico_linhas" "pl"
     JOIN "public"."acoes_estrategicas" "ae" ON (("ae"."id" = "pl"."acao_estrategica_id")))
     LEFT JOIN "public"."panoramico_setores" "ps" ON (("ps"."panoramico_linha_id" = "pl"."id")))
     LEFT JOIN "public"."setores" "s" ON (("s"."id" = "ps"."setor_id")))
  ORDER BY "ae"."numero", "pl"."ordem";


ALTER VIEW "public"."v_panoramico_completo" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_projeto_status" AS
 SELECT "id",
    "nome",
    "setor_lider_id",
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM "public"."entregas" "e"
              WHERE (("e"."projeto_id" = "p"."id") AND ("e"."status" <> ALL (ARRAY['resolvida'::"text", 'cancelada'::"text"])) AND ("e"."data_final_prevista" < CURRENT_DATE)))) THEN 'atrasado'::"text"
            WHEN (EXISTS ( SELECT 1
               FROM "public"."entregas" "e"
              WHERE (("e"."projeto_id" = "p"."id") AND ("e"."status" <> ALL (ARRAY['resolvida'::"text", 'cancelada'::"text"])) AND ("e"."data_final_prevista" >= CURRENT_DATE) AND ("e"."data_final_prevista" <= (CURRENT_DATE + '15 days'::interval))))) THEN 'proximo'::"text"
            ELSE 'em_dia'::"text"
        END AS "pontualidade",
    ( SELECT "min"("e"."data_final_prevista") AS "min"
           FROM "public"."entregas" "e"
          WHERE (("e"."projeto_id" = "p"."id") AND ("e"."status" <> ALL (ARRAY['resolvida'::"text", 'cancelada'::"text"])) AND ("e"."data_final_prevista" >= CURRENT_DATE))) AS "proxima_entrega"
   FROM "public"."projetos" "p";


ALTER VIEW "public"."v_projeto_status" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_setor_acoes" AS
 SELECT DISTINCT "s"."codigo" AS "setor_codigo",
    "s"."nome_completo" AS "setor_nome",
    "fs"."tipo_participacao",
    "ae"."numero" AS "acao_numero",
    "ae"."nome" AS "acao_nome",
    "f"."titulo" AS "ficha_titulo",
    "f"."papel" AS "ficha_papel"
   FROM ((("public"."ficha_setores" "fs"
     JOIN "public"."fichas" "f" ON (("f"."id" = "fs"."ficha_id")))
     JOIN "public"."acoes_estrategicas" "ae" ON (("ae"."id" = "f"."acao_estrategica_id")))
     JOIN "public"."setores" "s" ON (("s"."id" = "fs"."setor_id")))
  ORDER BY "s"."codigo", "ae"."numero";


ALTER VIEW "public"."v_setor_acoes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."acoes_estrategicas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."acoes_estrategicas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."atividade_participantes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."atividade_participantes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."atividades" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."atividades_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."audit_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audit_log_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."destaque_linhas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."destaque_linhas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."destaques_estrategicos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."destaques_estrategicos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."eixos_prioritarios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."eixos_prioritarios_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entrega_participantes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entrega_participantes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entregas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entregas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."estrategias" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."estrategias_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ficha_setores" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ficha_setores_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fichas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fichas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fundamentacao_itens" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fundamentacao_itens_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fundamentacoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fundamentacoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."objetivos_estrategicos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."objetivos_estrategicos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."observacoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."observacoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."panoramico_linhas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."panoramico_linhas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."panoramico_setores" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."panoramico_setores_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projeto_acoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projeto_acoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projetos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projetos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."setores" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."setores_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."acoes_estrategicas"
    ADD CONSTRAINT "acoes_estrategicas_numero_key" UNIQUE ("numero");



ALTER TABLE ONLY "public"."acoes_estrategicas"
    ADD CONSTRAINT "acoes_estrategicas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."atividade_participantes"
    ADD CONSTRAINT "atividade_participantes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."atividades"
    ADD CONSTRAINT "atividades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracoes"
    ADD CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("chave");



ALTER TABLE ONLY "public"."destaque_linhas"
    ADD CONSTRAINT "destaque_linhas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."destaques_estrategicos"
    ADD CONSTRAINT "destaques_estrategicos_acao_estrategica_id_key" UNIQUE ("acao_estrategica_id");



ALTER TABLE ONLY "public"."destaques_estrategicos"
    ADD CONSTRAINT "destaques_estrategicos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eixos_prioritarios"
    ADD CONSTRAINT "eixos_prioritarios_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."eixos_prioritarios"
    ADD CONSTRAINT "eixos_prioritarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entrega_participantes"
    ADD CONSTRAINT "entrega_participantes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entregas"
    ADD CONSTRAINT "entregas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estrategias"
    ADD CONSTRAINT "estrategias_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."estrategias"
    ADD CONSTRAINT "estrategias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ficha_setores"
    ADD CONSTRAINT "ficha_setores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fichas"
    ADD CONSTRAINT "fichas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fundamentacao_itens"
    ADD CONSTRAINT "fundamentacao_itens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fundamentacoes"
    ADD CONSTRAINT "fundamentacoes_acao_estrategica_id_key" UNIQUE ("acao_estrategica_id");



ALTER TABLE ONLY "public"."fundamentacoes"
    ADD CONSTRAINT "fundamentacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."objetivos_estrategicos"
    ADD CONSTRAINT "objetivos_estrategicos_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."objetivos_estrategicos"
    ADD CONSTRAINT "objetivos_estrategicos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."observacoes"
    ADD CONSTRAINT "observacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."panoramico_linhas"
    ADD CONSTRAINT "panoramico_linhas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."panoramico_setores"
    ADD CONSTRAINT "panoramico_setores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projeto_acoes"
    ADD CONSTRAINT "projeto_acoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projeto_acoes"
    ADD CONSTRAINT "projeto_acoes_projeto_id_acao_estrategica_id_key" UNIQUE ("projeto_id", "acao_estrategica_id");



ALTER TABLE ONLY "public"."projetos"
    ADD CONSTRAINT "projetos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."setores"
    ADD CONSTRAINT "setores_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."setores"
    ADD CONSTRAINT "setores_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ap_atividade" ON "public"."atividade_participantes" USING "btree" ("atividade_id");



CREATE UNIQUE INDEX "idx_ap_externo_unique" ON "public"."atividade_participantes" USING "btree" ("atividade_id", "tipo_participante") WHERE ("tipo_participante" <> 'setor'::"text");



CREATE INDEX "idx_ap_setor" ON "public"."atividade_participantes" USING "btree" ("setor_id");



CREATE UNIQUE INDEX "idx_ap_setor_unique" ON "public"."atividade_participantes" USING "btree" ("atividade_id", "setor_id") WHERE (("tipo_participante" = 'setor'::"text") AND ("setor_id" IS NOT NULL));



CREATE INDEX "idx_ativ_data" ON "public"."atividades" USING "btree" ("data_prevista");



CREATE INDEX "idx_ativ_entrega" ON "public"."atividades" USING "btree" ("entrega_id");



CREATE INDEX "idx_ativ_status" ON "public"."atividades" USING "btree" ("status");



CREATE INDEX "idx_audit_created" ON "public"."audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_entidade" ON "public"."audit_log" USING "btree" ("entidade", "entidade_id");



CREATE INDEX "idx_audit_usuario" ON "public"."audit_log" USING "btree" ("usuario_id");



CREATE INDEX "idx_destaque_acao" ON "public"."destaques_estrategicos" USING "btree" ("acao_estrategica_id");



CREATE INDEX "idx_destaque_linhas" ON "public"."destaque_linhas" USING "btree" ("destaque_id");



CREATE INDEX "idx_entregas_data" ON "public"."entregas" USING "btree" ("data_final_prevista");



CREATE INDEX "idx_entregas_projeto" ON "public"."entregas" USING "btree" ("projeto_id");



CREATE INDEX "idx_entregas_status" ON "public"."entregas" USING "btree" ("status");



CREATE INDEX "idx_ep_entrega" ON "public"."entrega_participantes" USING "btree" ("entrega_id");



CREATE UNIQUE INDEX "idx_ep_externo_unique" ON "public"."entrega_participantes" USING "btree" ("entrega_id", "tipo_participante") WHERE ("tipo_participante" <> 'setor'::"text");



CREATE INDEX "idx_ep_setor" ON "public"."entrega_participantes" USING "btree" ("setor_id");



CREATE UNIQUE INDEX "idx_ep_setor_unique" ON "public"."entrega_participantes" USING "btree" ("entrega_id", "setor_id") WHERE (("tipo_participante" = 'setor'::"text") AND ("setor_id" IS NOT NULL));



CREATE INDEX "idx_fund_acao" ON "public"."fundamentacoes" USING "btree" ("acao_estrategica_id");



CREATE INDEX "idx_fund_itens" ON "public"."fundamentacao_itens" USING "btree" ("fundamentacao_id");



CREATE INDEX "idx_obs_acao" ON "public"."observacoes" USING "btree" ("acao_estrategica_id");



CREATE INDEX "idx_obs_autor" ON "public"."observacoes" USING "btree" ("autor_id");



CREATE INDEX "idx_obs_bloco" ON "public"."observacoes" USING "btree" ("bloco");



CREATE INDEX "idx_obs_status" ON "public"."observacoes" USING "btree" ("status");



CREATE INDEX "idx_panoramico_setores_setor" ON "public"."panoramico_setores" USING "btree" ("setor_id");



CREATE INDEX "idx_proj_acoes_acao" ON "public"."projeto_acoes" USING "btree" ("acao_estrategica_id");



CREATE INDEX "idx_proj_acoes_projeto" ON "public"."projeto_acoes" USING "btree" ("projeto_id");



CREATE INDEX "idx_proj_criado_por" ON "public"."projetos" USING "btree" ("criado_por");



CREATE INDEX "idx_proj_setor_lider" ON "public"."projetos" USING "btree" ("setor_lider_id");



CREATE OR REPLACE TRIGGER "tr_acoes_updated" BEFORE UPDATE ON "public"."acoes_estrategicas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_atividades_updated" BEFORE UPDATE ON "public"."atividades" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_config_updated" BEFORE UPDATE ON "public"."configuracoes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_entregas_updated" BEFORE UPDATE ON "public"."entregas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_observacoes_updated" BEFORE UPDATE ON "public"."observacoes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_profiles_updated" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_projetos_updated" BEFORE UPDATE ON "public"."projetos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."acoes_estrategicas"
    ADD CONSTRAINT "acoes_estrategicas_eixo_prioritario_id_fkey" FOREIGN KEY ("eixo_prioritario_id") REFERENCES "public"."eixos_prioritarios"("id");



ALTER TABLE ONLY "public"."acoes_estrategicas"
    ADD CONSTRAINT "acoes_estrategicas_estrategia_id_fkey" FOREIGN KEY ("estrategia_id") REFERENCES "public"."estrategias"("id");



ALTER TABLE ONLY "public"."acoes_estrategicas"
    ADD CONSTRAINT "acoes_estrategicas_objetivo_estrategico_id_fkey" FOREIGN KEY ("objetivo_estrategico_id") REFERENCES "public"."objetivos_estrategicos"("id");



ALTER TABLE ONLY "public"."atividade_participantes"
    ADD CONSTRAINT "atividade_participantes_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "public"."atividades"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."atividade_participantes"
    ADD CONSTRAINT "atividade_participantes_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id");



ALTER TABLE ONLY "public"."atividades"
    ADD CONSTRAINT "atividades_entrega_id_fkey" FOREIGN KEY ("entrega_id") REFERENCES "public"."entregas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."configuracoes"
    ADD CONSTRAINT "configuracoes_atualizado_por_fkey" FOREIGN KEY ("atualizado_por") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."destaque_linhas"
    ADD CONSTRAINT "destaque_linhas_destaque_id_fkey" FOREIGN KEY ("destaque_id") REFERENCES "public"."destaques_estrategicos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."destaques_estrategicos"
    ADD CONSTRAINT "destaques_estrategicos_acao_estrategica_id_fkey" FOREIGN KEY ("acao_estrategica_id") REFERENCES "public"."acoes_estrategicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entrega_participantes"
    ADD CONSTRAINT "entrega_participantes_entrega_id_fkey" FOREIGN KEY ("entrega_id") REFERENCES "public"."entregas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entrega_participantes"
    ADD CONSTRAINT "entrega_participantes_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id");



ALTER TABLE ONLY "public"."entregas"
    ADD CONSTRAINT "entregas_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."estrategias"
    ADD CONSTRAINT "estrategias_objetivo_estrategico_id_fkey" FOREIGN KEY ("objetivo_estrategico_id") REFERENCES "public"."objetivos_estrategicos"("id");



ALTER TABLE ONLY "public"."ficha_setores"
    ADD CONSTRAINT "ficha_setores_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ficha_setores"
    ADD CONSTRAINT "ficha_setores_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id");



ALTER TABLE ONLY "public"."fichas"
    ADD CONSTRAINT "fichas_acao_estrategica_id_fkey" FOREIGN KEY ("acao_estrategica_id") REFERENCES "public"."acoes_estrategicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fundamentacao_itens"
    ADD CONSTRAINT "fundamentacao_itens_fundamentacao_id_fkey" FOREIGN KEY ("fundamentacao_id") REFERENCES "public"."fundamentacoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fundamentacoes"
    ADD CONSTRAINT "fundamentacoes_acao_estrategica_id_fkey" FOREIGN KEY ("acao_estrategica_id") REFERENCES "public"."acoes_estrategicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."observacoes"
    ADD CONSTRAINT "observacoes_acao_estrategica_id_fkey" FOREIGN KEY ("acao_estrategica_id") REFERENCES "public"."acoes_estrategicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."observacoes"
    ADD CONSTRAINT "observacoes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."observacoes"
    ADD CONSTRAINT "observacoes_respondido_por_fkey" FOREIGN KEY ("respondido_por") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."panoramico_linhas"
    ADD CONSTRAINT "panoramico_linhas_acao_estrategica_id_fkey" FOREIGN KEY ("acao_estrategica_id") REFERENCES "public"."acoes_estrategicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."panoramico_setores"
    ADD CONSTRAINT "panoramico_setores_panoramico_linha_id_fkey" FOREIGN KEY ("panoramico_linha_id") REFERENCES "public"."panoramico_linhas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."panoramico_setores"
    ADD CONSTRAINT "panoramico_setores_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id");



ALTER TABLE ONLY "public"."projeto_acoes"
    ADD CONSTRAINT "projeto_acoes_acao_estrategica_id_fkey" FOREIGN KEY ("acao_estrategica_id") REFERENCES "public"."acoes_estrategicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projeto_acoes"
    ADD CONSTRAINT "projeto_acoes_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projetos"
    ADD CONSTRAINT "projetos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."projetos"
    ADD CONSTRAINT "projetos_setor_lider_id_fkey" FOREIGN KEY ("setor_lider_id") REFERENCES "public"."setores"("id");



ALTER TABLE "public"."acoes_estrategicas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_acoes" ON "public"."acoes_estrategicas" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_delete_setores" ON "public"."setores" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "admin_dest_linhas" ON "public"."destaque_linhas" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_destaques" ON "public"."destaques_estrategicos" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_eixos" ON "public"."eixos_prioritarios" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_estrategias" ON "public"."estrategias" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_ficha_setores" ON "public"."ficha_setores" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_fichas" ON "public"."fichas" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_fund_itens" ON "public"."fundamentacao_itens" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_fundamentacoes" ON "public"."fundamentacoes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_insert_setores" ON "public"."setores" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "admin_objetivos" ON "public"."objetivos_estrategicos" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_pan_setores" ON "public"."panoramico_setores" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_panoramico" ON "public"."panoramico_linhas" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_setores" ON "public"."setores" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_update_setores" ON "public"."setores" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "ae_update_admin" ON "public"."acoes_estrategicas" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "ap_admin" ON "public"."atividade_participantes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "ap_gestor" ON "public"."atividade_participantes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."atividades" "a"
     JOIN "public"."entregas" "e" ON (("e"."id" = "a"."entrega_id")))
     JOIN "public"."projetos" "p" ON (("p"."id" = "e"."projeto_id")))
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("a"."id" = "atividade_participantes"."atividade_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."atividades" "a"
     JOIN "public"."entregas" "e" ON (("e"."id" = "a"."entrega_id")))
     JOIN "public"."projetos" "p" ON (("p"."id" = "e"."projeto_id")))
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("a"."id" = "atividade_participantes"."atividade_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id")))));



CREATE POLICY "ap_select" ON "public"."atividade_participantes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "ativ_admin" ON "public"."atividades" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "ativ_gestor" ON "public"."atividades" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."entregas" "e"
     JOIN "public"."projetos" "p" ON (("p"."id" = "e"."projeto_id")))
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("e"."id" = "atividades"."entrega_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."entregas" "e"
     JOIN "public"."projetos" "p" ON (("p"."id" = "e"."projeto_id")))
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("e"."id" = "atividades"."entrega_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id")))));



CREATE POLICY "ativ_select" ON "public"."atividades" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."atividade_participantes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."atividades" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_admin" ON "public"."audit_log" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "audit_gestor_insert" ON "public"."audit_log" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'gestor'::"text"]))))));



ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_select_admin" ON "public"."audit_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "config_admin_all" ON "public"."configuracoes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "config_select" ON "public"."configuracoes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "config_select_anon" ON "public"."configuracoes" FOR SELECT TO "anon" USING (true);



CREATE POLICY "config_update_admin" ON "public"."configuracoes" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."configuracoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dest_linhas_update_admin" ON "public"."destaque_linhas" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "dest_update_admin" ON "public"."destaques_estrategicos" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."destaque_linhas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."destaques_estrategicos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eixos_prioritarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ent_admin" ON "public"."entregas" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "ent_gestor" ON "public"."entregas" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."projetos" "p"
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("p"."id" = "entregas"."projeto_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."projetos" "p"
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("p"."id" = "entregas"."projeto_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id")))));



CREATE POLICY "ent_select" ON "public"."entregas" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."entrega_participantes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entregas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ep_admin" ON "public"."entrega_participantes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "ep_gestor" ON "public"."entrega_participantes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."entregas" "e"
     JOIN "public"."projetos" "p" ON (("p"."id" = "e"."projeto_id")))
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("e"."id" = "entrega_participantes"."entrega_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."entregas" "e"
     JOIN "public"."projetos" "p" ON (("p"."id" = "e"."projeto_id")))
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("e"."id" = "entrega_participantes"."entrega_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id")))));



CREATE POLICY "ep_select" ON "public"."entrega_participantes" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."estrategias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ficha_setores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fichas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fichas_update_admin" ON "public"."fichas" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "fund_itens_update_admin" ON "public"."fundamentacao_itens" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "fund_update_admin" ON "public"."fundamentacoes" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."fundamentacao_itens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fundamentacoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leitura_publica_acoes" ON "public"."acoes_estrategicas" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_dest_linhas" ON "public"."destaque_linhas" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_destaques" ON "public"."destaques_estrategicos" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_eixos" ON "public"."eixos_prioritarios" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_estrategias" ON "public"."estrategias" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_ficha_setores" ON "public"."ficha_setores" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_fichas" ON "public"."fichas" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_fund_itens" ON "public"."fundamentacao_itens" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_fundamentacoes" ON "public"."fundamentacoes" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_objetivos" ON "public"."objetivos_estrategicos" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_pan_setores" ON "public"."panoramico_setores" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_panoramico" ON "public"."panoramico_linhas" FOR SELECT USING (true);



CREATE POLICY "leitura_publica_setores" ON "public"."setores" FOR SELECT USING (true);



ALTER TABLE "public"."objetivos_estrategicos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "obs_admin" ON "public"."observacoes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "obs_delete_own" ON "public"."observacoes" FOR DELETE TO "authenticated" USING ((("autor_id" = "auth"."uid"()) AND ("status" = 'em_analise'::"text")));



CREATE POLICY "obs_insert" ON "public"."observacoes" FOR INSERT TO "authenticated" WITH CHECK (("autor_id" = "auth"."uid"()));



CREATE POLICY "obs_select" ON "public"."observacoes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "obs_update_admin" ON "public"."observacoes" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'gestor'::"text"]))))));



CREATE POLICY "obs_update_own" ON "public"."observacoes" FOR UPDATE TO "authenticated" USING ((("autor_id" = "auth"."uid"()) AND ("status" = 'em_analise'::"text")));



ALTER TABLE "public"."observacoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pa_admin" ON "public"."projeto_acoes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "pa_gestor" ON "public"."projeto_acoes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."projetos" "p"
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("p"."id" = "projeto_acoes"."projeto_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."projetos" "p"
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "auth"."uid"())))
  WHERE (("p"."id" = "projeto_acoes"."projeto_id") AND ("pr"."role" = 'gestor'::"text") AND ("pr"."setor_id" = "p"."setor_lider_id")))));



CREATE POLICY "pa_select" ON "public"."projeto_acoes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "pan_update_admin" ON "public"."panoramico_linhas" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."panoramico_linhas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."panoramico_setores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin" ON "public"."profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "profiles_update_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"text")))));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "proj_admin" ON "public"."projetos" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "proj_gestor_delete" ON "public"."projetos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"text") AND ("profiles"."setor_id" = "projetos"."setor_lider_id")))));



CREATE POLICY "proj_gestor_insert" ON "public"."projetos" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"text") AND ("profiles"."setor_id" = "projetos"."setor_lider_id")))));



CREATE POLICY "proj_gestor_update" ON "public"."projetos" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"text") AND ("profiles"."setor_id" = "projetos"."setor_lider_id")))));



CREATE POLICY "proj_select" ON "public"."projetos" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."projeto_acoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projetos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."setores" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."admin_delete_setor"("p_setor_id" integer, "p_transfer_to_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_setor"("p_setor_id" integer, "p_transfer_to_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_setor"("p_setor_id" integer, "p_transfer_to_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_acao_campo"("acao_numero" "text", "campo" "text", "novo_valor" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_acao_campo"("acao_numero" "text", "campo" "text", "novo_valor" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_acao_campo"("acao_numero" "text", "campo" "text", "novo_valor" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_observacao"("obs_id" integer, "novo_status" "text", "resposta" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_observacao"("obs_id" integer, "novo_status" "text", "resposta" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_observacao"("obs_id" integer, "novo_status" "text", "resposta" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_setor_dependencies"("p_setor_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_setor_dependencies"("p_setor_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_setor_dependencies"("p_setor_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."acoes_estrategicas" TO "anon";
GRANT ALL ON TABLE "public"."acoes_estrategicas" TO "authenticated";
GRANT ALL ON TABLE "public"."acoes_estrategicas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."acoes_estrategicas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."acoes_estrategicas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."acoes_estrategicas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."atividade_participantes" TO "anon";
GRANT ALL ON TABLE "public"."atividade_participantes" TO "authenticated";
GRANT ALL ON TABLE "public"."atividade_participantes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."atividade_participantes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."atividade_participantes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."atividade_participantes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."atividades" TO "anon";
GRANT ALL ON TABLE "public"."atividades" TO "authenticated";
GRANT ALL ON TABLE "public"."atividades" TO "service_role";



GRANT ALL ON SEQUENCE "public"."atividades_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."atividades_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."atividades_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audit_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audit_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audit_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."configuracoes" TO "anon";
GRANT ALL ON TABLE "public"."configuracoes" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracoes" TO "service_role";



GRANT ALL ON TABLE "public"."destaque_linhas" TO "anon";
GRANT ALL ON TABLE "public"."destaque_linhas" TO "authenticated";
GRANT ALL ON TABLE "public"."destaque_linhas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."destaque_linhas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."destaque_linhas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."destaque_linhas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."destaques_estrategicos" TO "anon";
GRANT ALL ON TABLE "public"."destaques_estrategicos" TO "authenticated";
GRANT ALL ON TABLE "public"."destaques_estrategicos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."destaques_estrategicos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."destaques_estrategicos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."destaques_estrategicos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."eixos_prioritarios" TO "anon";
GRANT ALL ON TABLE "public"."eixos_prioritarios" TO "authenticated";
GRANT ALL ON TABLE "public"."eixos_prioritarios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."eixos_prioritarios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."eixos_prioritarios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."eixos_prioritarios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."entrega_participantes" TO "anon";
GRANT ALL ON TABLE "public"."entrega_participantes" TO "authenticated";
GRANT ALL ON TABLE "public"."entrega_participantes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entrega_participantes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entrega_participantes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entrega_participantes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."entregas" TO "anon";
GRANT ALL ON TABLE "public"."entregas" TO "authenticated";
GRANT ALL ON TABLE "public"."entregas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entregas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entregas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entregas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."estrategias" TO "anon";
GRANT ALL ON TABLE "public"."estrategias" TO "authenticated";
GRANT ALL ON TABLE "public"."estrategias" TO "service_role";



GRANT ALL ON SEQUENCE "public"."estrategias_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."estrategias_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."estrategias_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ficha_setores" TO "anon";
GRANT ALL ON TABLE "public"."ficha_setores" TO "authenticated";
GRANT ALL ON TABLE "public"."ficha_setores" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ficha_setores_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ficha_setores_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ficha_setores_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fichas" TO "anon";
GRANT ALL ON TABLE "public"."fichas" TO "authenticated";
GRANT ALL ON TABLE "public"."fichas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fichas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fichas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fichas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fundamentacao_itens" TO "anon";
GRANT ALL ON TABLE "public"."fundamentacao_itens" TO "authenticated";
GRANT ALL ON TABLE "public"."fundamentacao_itens" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fundamentacao_itens_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fundamentacao_itens_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fundamentacao_itens_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fundamentacoes" TO "anon";
GRANT ALL ON TABLE "public"."fundamentacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."fundamentacoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fundamentacoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fundamentacoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fundamentacoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."objetivos_estrategicos" TO "anon";
GRANT ALL ON TABLE "public"."objetivos_estrategicos" TO "authenticated";
GRANT ALL ON TABLE "public"."objetivos_estrategicos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."objetivos_estrategicos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."objetivos_estrategicos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."objetivos_estrategicos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."observacoes" TO "anon";
GRANT ALL ON TABLE "public"."observacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."observacoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."observacoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."observacoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."observacoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."panoramico_linhas" TO "anon";
GRANT ALL ON TABLE "public"."panoramico_linhas" TO "authenticated";
GRANT ALL ON TABLE "public"."panoramico_linhas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."panoramico_linhas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."panoramico_linhas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."panoramico_linhas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."panoramico_setores" TO "anon";
GRANT ALL ON TABLE "public"."panoramico_setores" TO "authenticated";
GRANT ALL ON TABLE "public"."panoramico_setores" TO "service_role";



GRANT ALL ON SEQUENCE "public"."panoramico_setores_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."panoramico_setores_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."panoramico_setores_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."projeto_acoes" TO "anon";
GRANT ALL ON TABLE "public"."projeto_acoes" TO "authenticated";
GRANT ALL ON TABLE "public"."projeto_acoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projeto_acoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projeto_acoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projeto_acoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projetos" TO "anon";
GRANT ALL ON TABLE "public"."projetos" TO "authenticated";
GRANT ALL ON TABLE "public"."projetos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projetos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projetos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projetos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."setores" TO "anon";
GRANT ALL ON TABLE "public"."setores" TO "authenticated";
GRANT ALL ON TABLE "public"."setores" TO "service_role";



GRANT ALL ON SEQUENCE "public"."setores_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."setores_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."setores_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_observacoes" TO "anon";
GRANT ALL ON TABLE "public"."v_observacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."v_observacoes" TO "service_role";



GRANT ALL ON TABLE "public"."v_panoramico_completo" TO "anon";
GRANT ALL ON TABLE "public"."v_panoramico_completo" TO "authenticated";
GRANT ALL ON TABLE "public"."v_panoramico_completo" TO "service_role";



GRANT ALL ON TABLE "public"."v_projeto_status" TO "anon";
GRANT ALL ON TABLE "public"."v_projeto_status" TO "authenticated";
GRANT ALL ON TABLE "public"."v_projeto_status" TO "service_role";



GRANT ALL ON TABLE "public"."v_setor_acoes" TO "anon";
GRANT ALL ON TABLE "public"."v_setor_acoes" TO "authenticated";
GRANT ALL ON TABLE "public"."v_setor_acoes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



drop extension if exists "pg_net";

create sequence "public"."acoes_estrategicas_id_seq";

create sequence "public"."atividade_participantes_id_seq";

create sequence "public"."atividades_id_seq";

create sequence "public"."audit_log_id_seq";

create sequence "public"."destaque_linhas_id_seq";

create sequence "public"."destaques_estrategicos_id_seq";

create sequence "public"."eixos_prioritarios_id_seq";

create sequence "public"."entrega_participantes_id_seq";

create sequence "public"."entregas_id_seq";

create sequence "public"."estrategias_id_seq";

create sequence "public"."ficha_setores_id_seq";

create sequence "public"."fichas_id_seq";

create sequence "public"."fundamentacao_itens_id_seq";

create sequence "public"."fundamentacoes_id_seq";

create sequence "public"."objetivos_estrategicos_id_seq";

create sequence "public"."observacoes_id_seq";

create sequence "public"."panoramico_linhas_id_seq";

create sequence "public"."panoramico_setores_id_seq";

create sequence "public"."projeto_acoes_id_seq";

create sequence "public"."projetos_id_seq";

create sequence "public"."setores_id_seq";


  create table "public"."acoes_estrategicas" (
    "id" integer not null default nextval('public.acoes_estrategicas_id_seq'::regclass),
    "numero" text not null,
    "nome" text not null,
    "eixo_prioritario_id" integer,
    "objetivo_estrategico_id" integer,
    "estrategia_id" integer,
    "acoes_conectadas" text,
    "descricao_oficial_completa" text,
    "descricao_o_que" text,
    "descricao_para_que" text,
    "ancoragem" text,
    "nota_arranjo_institucional" text,
    "versao" text default '1.0'::text,
    "data_elaboracao" date,
    "elaboracao" text default 'ICTDEC/DAEAD'::text,
    "proxima_fase" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."acoes_estrategicas" enable row level security;


  create table "public"."atividade_participantes" (
    "id" integer not null default nextval('public.atividade_participantes_id_seq'::regclass),
    "atividade_id" integer not null,
    "setor_id" integer,
    "tipo_participante" text not null default 'setor'::text,
    "papel" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."atividade_participantes" enable row level security;


  create table "public"."atividades" (
    "id" integer not null default nextval('public.atividades_id_seq'::regclass),
    "entrega_id" integer not null,
    "nome" text not null,
    "descricao" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "data_prevista" date,
    "status" text not null default 'aberta'::text,
    "motivo_status" text
      );


alter table "public"."atividades" enable row level security;


  create table "public"."audit_log" (
    "id" integer not null default nextval('public.audit_log_id_seq'::regclass),
    "usuario_id" uuid not null,
    "usuario_nome" text,
    "tipo_acao" text not null,
    "entidade" text not null,
    "entidade_id" integer not null,
    "conteudo_anterior" jsonb,
    "conteudo_novo" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."audit_log" enable row level security;


  create table "public"."configuracoes" (
    "chave" text not null,
    "valor" text not null,
    "descricao" text,
    "atualizado_por" uuid,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."configuracoes" enable row level security;


  create table "public"."destaque_linhas" (
    "id" integer not null default nextval('public.destaque_linhas_id_seq'::regclass),
    "destaque_id" integer not null,
    "ordem" integer not null,
    "tipo" text not null,
    "label" text,
    "conteudo" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."destaque_linhas" enable row level security;


  create table "public"."destaques_estrategicos" (
    "id" integer not null default nextval('public.destaques_estrategicos_id_seq'::regclass),
    "acao_estrategica_id" integer not null,
    "titulo" text not null,
    "header_contexto" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."destaques_estrategicos" enable row level security;


  create table "public"."eixos_prioritarios" (
    "id" integer not null default nextval('public.eixos_prioritarios_id_seq'::regclass),
    "codigo" text not null,
    "nome" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."eixos_prioritarios" enable row level security;


  create table "public"."entrega_participantes" (
    "id" integer not null default nextval('public.entrega_participantes_id_seq'::regclass),
    "entrega_id" integer not null,
    "setor_id" integer,
    "tipo_participante" text not null default 'setor'::text,
    "papel" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."entrega_participantes" enable row level security;


  create table "public"."entregas" (
    "id" integer not null default nextval('public.entregas_id_seq'::regclass),
    "projeto_id" integer not null,
    "nome" text not null,
    "descricao" text not null,
    "dependencias_criticas" text,
    "data_final_prevista" date,
    "status" text not null default 'aberta'::text,
    "motivo_status" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."entregas" enable row level security;


  create table "public"."estrategias" (
    "id" integer not null default nextval('public.estrategias_id_seq'::regclass),
    "codigo" text not null,
    "nome" text not null,
    "objetivo_estrategico_id" integer,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."estrategias" enable row level security;


  create table "public"."ficha_setores" (
    "id" integer not null default nextval('public.ficha_setores_id_seq'::regclass),
    "ficha_id" integer not null,
    "setor_id" integer not null,
    "tipo_participacao" text not null default 'principal'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ficha_setores" enable row level security;


  create table "public"."fichas" (
    "id" integer not null default nextval('public.fichas_id_seq'::regclass),
    "acao_estrategica_id" integer not null,
    "ordem" integer not null,
    "titulo" text not null,
    "setor_display" text not null,
    "papel" text not null,
    "justificativa" text not null,
    "contribuicao_esperada" text[] not null,
    "nao_escopo" text[] not null,
    "dependencias_criticas" text[] not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."fichas" enable row level security;


  create table "public"."fundamentacao_itens" (
    "id" integer not null default nextval('public.fundamentacao_itens_id_seq'::regclass),
    "fundamentacao_id" integer not null,
    "ordem" integer not null,
    "conteudo" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."fundamentacao_itens" enable row level security;


  create table "public"."fundamentacoes" (
    "id" integer not null default nextval('public.fundamentacoes_id_seq'::regclass),
    "acao_estrategica_id" integer not null,
    "introducao" text,
    "conclusao" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."fundamentacoes" enable row level security;


  create table "public"."objetivos_estrategicos" (
    "id" integer not null default nextval('public.objetivos_estrategicos_id_seq'::regclass),
    "codigo" text not null,
    "nome" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."objetivos_estrategicos" enable row level security;


  create table "public"."observacoes" (
    "id" integer not null default nextval('public.observacoes_id_seq'::regclass),
    "acao_estrategica_id" integer not null,
    "bloco" text not null,
    "conteudo" text not null,
    "autor_id" uuid not null,
    "autor_nome" text not null,
    "autor_setor" text,
    "status" text not null default 'em_analise'::text,
    "resposta_admin" text,
    "respondido_por" uuid,
    "respondido_em" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."observacoes" enable row level security;


  create table "public"."panoramico_linhas" (
    "id" integer not null default nextval('public.panoramico_linhas_id_seq'::regclass),
    "acao_estrategica_id" integer not null,
    "ordem" integer not null,
    "setor_display" text not null,
    "papel" text not null,
    "sintese_contribuicao" text,
    "nao_faz" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."panoramico_linhas" enable row level security;


  create table "public"."panoramico_setores" (
    "id" integer not null default nextval('public.panoramico_setores_id_seq'::regclass),
    "panoramico_linha_id" integer not null,
    "setor_id" integer not null,
    "tipo_participacao" text not null default 'principal'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."panoramico_setores" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "nome" text not null,
    "setor_id" integer,
    "role" text not null default 'usuario'::text,
    "ativo" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."projeto_acoes" (
    "id" integer not null default nextval('public.projeto_acoes_id_seq'::regclass),
    "projeto_id" integer not null,
    "acao_estrategica_id" integer not null
      );


alter table "public"."projeto_acoes" enable row level security;


  create table "public"."projetos" (
    "id" integer not null default nextval('public.projetos_id_seq'::regclass),
    "nome" text not null,
    "descricao" text not null,
    "problema_resolve" text not null,
    "setor_lider_id" integer not null,
    "criado_por" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."projetos" enable row level security;


  create table "public"."setores" (
    "id" integer not null default nextval('public.setores_id_seq'::regclass),
    "codigo" text not null,
    "nome_completo" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."setores" enable row level security;


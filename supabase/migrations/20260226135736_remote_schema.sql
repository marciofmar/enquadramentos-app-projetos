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

alter sequence "public"."acoes_estrategicas_id_seq" owned by "public"."acoes_estrategicas"."id";

alter sequence "public"."atividade_participantes_id_seq" owned by "public"."atividade_participantes"."id";

alter sequence "public"."atividades_id_seq" owned by "public"."atividades"."id";

alter sequence "public"."audit_log_id_seq" owned by "public"."audit_log"."id";

alter sequence "public"."destaque_linhas_id_seq" owned by "public"."destaque_linhas"."id";

alter sequence "public"."destaques_estrategicos_id_seq" owned by "public"."destaques_estrategicos"."id";

alter sequence "public"."eixos_prioritarios_id_seq" owned by "public"."eixos_prioritarios"."id";

alter sequence "public"."entrega_participantes_id_seq" owned by "public"."entrega_participantes"."id";

alter sequence "public"."entregas_id_seq" owned by "public"."entregas"."id";

alter sequence "public"."estrategias_id_seq" owned by "public"."estrategias"."id";

alter sequence "public"."ficha_setores_id_seq" owned by "public"."ficha_setores"."id";

alter sequence "public"."fichas_id_seq" owned by "public"."fichas"."id";

alter sequence "public"."fundamentacao_itens_id_seq" owned by "public"."fundamentacao_itens"."id";

alter sequence "public"."fundamentacoes_id_seq" owned by "public"."fundamentacoes"."id";

alter sequence "public"."objetivos_estrategicos_id_seq" owned by "public"."objetivos_estrategicos"."id";

alter sequence "public"."observacoes_id_seq" owned by "public"."observacoes"."id";

alter sequence "public"."panoramico_linhas_id_seq" owned by "public"."panoramico_linhas"."id";

alter sequence "public"."panoramico_setores_id_seq" owned by "public"."panoramico_setores"."id";

alter sequence "public"."projeto_acoes_id_seq" owned by "public"."projeto_acoes"."id";

alter sequence "public"."projetos_id_seq" owned by "public"."projetos"."id";

alter sequence "public"."setores_id_seq" owned by "public"."setores"."id";

CREATE UNIQUE INDEX acoes_estrategicas_numero_key ON public.acoes_estrategicas USING btree (numero);

CREATE UNIQUE INDEX acoes_estrategicas_pkey ON public.acoes_estrategicas USING btree (id);

CREATE UNIQUE INDEX atividade_participantes_pkey ON public.atividade_participantes USING btree (id);

CREATE UNIQUE INDEX atividades_pkey ON public.atividades USING btree (id);

CREATE UNIQUE INDEX audit_log_pkey ON public.audit_log USING btree (id);

CREATE UNIQUE INDEX configuracoes_pkey ON public.configuracoes USING btree (chave);

CREATE UNIQUE INDEX destaque_linhas_pkey ON public.destaque_linhas USING btree (id);

CREATE UNIQUE INDEX destaques_estrategicos_acao_estrategica_id_key ON public.destaques_estrategicos USING btree (acao_estrategica_id);

CREATE UNIQUE INDEX destaques_estrategicos_pkey ON public.destaques_estrategicos USING btree (id);

CREATE UNIQUE INDEX eixos_prioritarios_codigo_key ON public.eixos_prioritarios USING btree (codigo);

CREATE UNIQUE INDEX eixos_prioritarios_pkey ON public.eixos_prioritarios USING btree (id);

CREATE UNIQUE INDEX entrega_participantes_pkey ON public.entrega_participantes USING btree (id);

CREATE UNIQUE INDEX entregas_pkey ON public.entregas USING btree (id);

CREATE UNIQUE INDEX estrategias_codigo_key ON public.estrategias USING btree (codigo);

CREATE UNIQUE INDEX estrategias_pkey ON public.estrategias USING btree (id);

CREATE UNIQUE INDEX ficha_setores_pkey ON public.ficha_setores USING btree (id);

CREATE UNIQUE INDEX fichas_pkey ON public.fichas USING btree (id);

CREATE UNIQUE INDEX fundamentacao_itens_pkey ON public.fundamentacao_itens USING btree (id);

CREATE UNIQUE INDEX fundamentacoes_acao_estrategica_id_key ON public.fundamentacoes USING btree (acao_estrategica_id);

CREATE UNIQUE INDEX fundamentacoes_pkey ON public.fundamentacoes USING btree (id);

CREATE INDEX idx_ap_atividade ON public.atividade_participantes USING btree (atividade_id);

CREATE UNIQUE INDEX idx_ap_externo_unique ON public.atividade_participantes USING btree (atividade_id, tipo_participante) WHERE (tipo_participante <> 'setor'::text);

CREATE INDEX idx_ap_setor ON public.atividade_participantes USING btree (setor_id);

CREATE UNIQUE INDEX idx_ap_setor_unique ON public.atividade_participantes USING btree (atividade_id, setor_id) WHERE ((tipo_participante = 'setor'::text) AND (setor_id IS NOT NULL));

CREATE INDEX idx_ativ_data ON public.atividades USING btree (data_prevista);

CREATE INDEX idx_ativ_entrega ON public.atividades USING btree (entrega_id);

CREATE INDEX idx_ativ_status ON public.atividades USING btree (status);

CREATE INDEX idx_audit_created ON public.audit_log USING btree (created_at DESC);

CREATE INDEX idx_audit_entidade ON public.audit_log USING btree (entidade, entidade_id);

CREATE INDEX idx_audit_usuario ON public.audit_log USING btree (usuario_id);

CREATE INDEX idx_destaque_acao ON public.destaques_estrategicos USING btree (acao_estrategica_id);

CREATE INDEX idx_destaque_linhas ON public.destaque_linhas USING btree (destaque_id);

CREATE INDEX idx_entregas_data ON public.entregas USING btree (data_final_prevista);

CREATE INDEX idx_entregas_projeto ON public.entregas USING btree (projeto_id);

CREATE INDEX idx_entregas_status ON public.entregas USING btree (status);

CREATE INDEX idx_ep_entrega ON public.entrega_participantes USING btree (entrega_id);

CREATE UNIQUE INDEX idx_ep_externo_unique ON public.entrega_participantes USING btree (entrega_id, tipo_participante) WHERE (tipo_participante <> 'setor'::text);

CREATE INDEX idx_ep_setor ON public.entrega_participantes USING btree (setor_id);

CREATE UNIQUE INDEX idx_ep_setor_unique ON public.entrega_participantes USING btree (entrega_id, setor_id) WHERE ((tipo_participante = 'setor'::text) AND (setor_id IS NOT NULL));

CREATE INDEX idx_fund_acao ON public.fundamentacoes USING btree (acao_estrategica_id);

CREATE INDEX idx_fund_itens ON public.fundamentacao_itens USING btree (fundamentacao_id);

CREATE INDEX idx_obs_acao ON public.observacoes USING btree (acao_estrategica_id);

CREATE INDEX idx_obs_autor ON public.observacoes USING btree (autor_id);

CREATE INDEX idx_obs_bloco ON public.observacoes USING btree (bloco);

CREATE INDEX idx_obs_status ON public.observacoes USING btree (status);

CREATE INDEX idx_panoramico_setores_setor ON public.panoramico_setores USING btree (setor_id);

CREATE INDEX idx_proj_acoes_acao ON public.projeto_acoes USING btree (acao_estrategica_id);

CREATE INDEX idx_proj_acoes_projeto ON public.projeto_acoes USING btree (projeto_id);

CREATE INDEX idx_proj_criado_por ON public.projetos USING btree (criado_por);

CREATE INDEX idx_proj_setor_lider ON public.projetos USING btree (setor_lider_id);

CREATE UNIQUE INDEX objetivos_estrategicos_codigo_key ON public.objetivos_estrategicos USING btree (codigo);

CREATE UNIQUE INDEX objetivos_estrategicos_pkey ON public.objetivos_estrategicos USING btree (id);

CREATE UNIQUE INDEX observacoes_pkey ON public.observacoes USING btree (id);

CREATE UNIQUE INDEX panoramico_linhas_pkey ON public.panoramico_linhas USING btree (id);

CREATE UNIQUE INDEX panoramico_setores_pkey ON public.panoramico_setores USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX projeto_acoes_pkey ON public.projeto_acoes USING btree (id);

CREATE UNIQUE INDEX projeto_acoes_projeto_id_acao_estrategica_id_key ON public.projeto_acoes USING btree (projeto_id, acao_estrategica_id);

CREATE UNIQUE INDEX projetos_pkey ON public.projetos USING btree (id);

CREATE UNIQUE INDEX setores_codigo_key ON public.setores USING btree (codigo);

CREATE UNIQUE INDEX setores_pkey ON public.setores USING btree (id);

alter table "public"."acoes_estrategicas" add constraint "acoes_estrategicas_pkey" PRIMARY KEY using index "acoes_estrategicas_pkey";

alter table "public"."atividade_participantes" add constraint "atividade_participantes_pkey" PRIMARY KEY using index "atividade_participantes_pkey";

alter table "public"."atividades" add constraint "atividades_pkey" PRIMARY KEY using index "atividades_pkey";

alter table "public"."audit_log" add constraint "audit_log_pkey" PRIMARY KEY using index "audit_log_pkey";

alter table "public"."configuracoes" add constraint "configuracoes_pkey" PRIMARY KEY using index "configuracoes_pkey";

alter table "public"."destaque_linhas" add constraint "destaque_linhas_pkey" PRIMARY KEY using index "destaque_linhas_pkey";

alter table "public"."destaques_estrategicos" add constraint "destaques_estrategicos_pkey" PRIMARY KEY using index "destaques_estrategicos_pkey";

alter table "public"."eixos_prioritarios" add constraint "eixos_prioritarios_pkey" PRIMARY KEY using index "eixos_prioritarios_pkey";

alter table "public"."entrega_participantes" add constraint "entrega_participantes_pkey" PRIMARY KEY using index "entrega_participantes_pkey";

alter table "public"."entregas" add constraint "entregas_pkey" PRIMARY KEY using index "entregas_pkey";

alter table "public"."estrategias" add constraint "estrategias_pkey" PRIMARY KEY using index "estrategias_pkey";

alter table "public"."ficha_setores" add constraint "ficha_setores_pkey" PRIMARY KEY using index "ficha_setores_pkey";

alter table "public"."fichas" add constraint "fichas_pkey" PRIMARY KEY using index "fichas_pkey";

alter table "public"."fundamentacao_itens" add constraint "fundamentacao_itens_pkey" PRIMARY KEY using index "fundamentacao_itens_pkey";

alter table "public"."fundamentacoes" add constraint "fundamentacoes_pkey" PRIMARY KEY using index "fundamentacoes_pkey";

alter table "public"."objetivos_estrategicos" add constraint "objetivos_estrategicos_pkey" PRIMARY KEY using index "objetivos_estrategicos_pkey";

alter table "public"."observacoes" add constraint "observacoes_pkey" PRIMARY KEY using index "observacoes_pkey";

alter table "public"."panoramico_linhas" add constraint "panoramico_linhas_pkey" PRIMARY KEY using index "panoramico_linhas_pkey";

alter table "public"."panoramico_setores" add constraint "panoramico_setores_pkey" PRIMARY KEY using index "panoramico_setores_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."projeto_acoes" add constraint "projeto_acoes_pkey" PRIMARY KEY using index "projeto_acoes_pkey";

alter table "public"."projetos" add constraint "projetos_pkey" PRIMARY KEY using index "projetos_pkey";

alter table "public"."setores" add constraint "setores_pkey" PRIMARY KEY using index "setores_pkey";

alter table "public"."acoes_estrategicas" add constraint "acoes_estrategicas_eixo_prioritario_id_fkey" FOREIGN KEY (eixo_prioritario_id) REFERENCES public.eixos_prioritarios(id) not valid;

alter table "public"."acoes_estrategicas" validate constraint "acoes_estrategicas_eixo_prioritario_id_fkey";

alter table "public"."acoes_estrategicas" add constraint "acoes_estrategicas_estrategia_id_fkey" FOREIGN KEY (estrategia_id) REFERENCES public.estrategias(id) not valid;

alter table "public"."acoes_estrategicas" validate constraint "acoes_estrategicas_estrategia_id_fkey";

alter table "public"."acoes_estrategicas" add constraint "acoes_estrategicas_numero_key" UNIQUE using index "acoes_estrategicas_numero_key";

alter table "public"."acoes_estrategicas" add constraint "acoes_estrategicas_objetivo_estrategico_id_fkey" FOREIGN KEY (objetivo_estrategico_id) REFERENCES public.objetivos_estrategicos(id) not valid;

alter table "public"."acoes_estrategicas" validate constraint "acoes_estrategicas_objetivo_estrategico_id_fkey";

alter table "public"."atividade_participantes" add constraint "atividade_participantes_atividade_id_fkey" FOREIGN KEY (atividade_id) REFERENCES public.atividades(id) ON DELETE CASCADE not valid;

alter table "public"."atividade_participantes" validate constraint "atividade_participantes_atividade_id_fkey";

alter table "public"."atividade_participantes" add constraint "atividade_participantes_setor_id_fkey" FOREIGN KEY (setor_id) REFERENCES public.setores(id) not valid;

alter table "public"."atividade_participantes" validate constraint "atividade_participantes_setor_id_fkey";

alter table "public"."atividade_participantes" add constraint "atividade_participantes_tipo_participante_check" CHECK ((tipo_participante = ANY (ARRAY['setor'::text, 'externo_subsegop'::text, 'externo_sedec'::text]))) not valid;

alter table "public"."atividade_participantes" validate constraint "atividade_participantes_tipo_participante_check";

alter table "public"."atividades" add constraint "atividades_entrega_id_fkey" FOREIGN KEY (entrega_id) REFERENCES public.entregas(id) ON DELETE CASCADE not valid;

alter table "public"."atividades" validate constraint "atividades_entrega_id_fkey";

alter table "public"."atividades" add constraint "atividades_status_check" CHECK ((status = ANY (ARRAY['aberta'::text, 'em_andamento'::text, 'aguardando'::text, 'resolvida'::text, 'cancelada'::text]))) not valid;

alter table "public"."atividades" validate constraint "atividades_status_check";

alter table "public"."audit_log" add constraint "audit_log_entidade_check" CHECK ((entidade = ANY (ARRAY['projeto'::text, 'entrega'::text, 'atividade'::text, 'entrega_participante'::text, 'atividade_participante'::text]))) not valid;

alter table "public"."audit_log" validate constraint "audit_log_entidade_check";

alter table "public"."audit_log" add constraint "audit_log_tipo_acao_check" CHECK ((tipo_acao = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text]))) not valid;

alter table "public"."audit_log" validate constraint "audit_log_tipo_acao_check";

alter table "public"."audit_log" add constraint "audit_log_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES public.profiles(id) not valid;

alter table "public"."audit_log" validate constraint "audit_log_usuario_id_fkey";

alter table "public"."configuracoes" add constraint "configuracoes_atualizado_por_fkey" FOREIGN KEY (atualizado_por) REFERENCES public.profiles(id) not valid;

alter table "public"."configuracoes" validate constraint "configuracoes_atualizado_por_fkey";

alter table "public"."destaque_linhas" add constraint "destaque_linhas_destaque_id_fkey" FOREIGN KEY (destaque_id) REFERENCES public.destaques_estrategicos(id) ON DELETE CASCADE not valid;

alter table "public"."destaque_linhas" validate constraint "destaque_linhas_destaque_id_fkey";

alter table "public"."destaque_linhas" add constraint "destaque_linhas_tipo_check" CHECK ((tipo = ANY (ARRAY['label_conteudo'::text, 'header'::text]))) not valid;

alter table "public"."destaque_linhas" validate constraint "destaque_linhas_tipo_check";

alter table "public"."destaques_estrategicos" add constraint "destaques_estrategicos_acao_estrategica_id_fkey" FOREIGN KEY (acao_estrategica_id) REFERENCES public.acoes_estrategicas(id) ON DELETE CASCADE not valid;

alter table "public"."destaques_estrategicos" validate constraint "destaques_estrategicos_acao_estrategica_id_fkey";

alter table "public"."destaques_estrategicos" add constraint "destaques_estrategicos_acao_estrategica_id_key" UNIQUE using index "destaques_estrategicos_acao_estrategica_id_key";

alter table "public"."eixos_prioritarios" add constraint "eixos_prioritarios_codigo_key" UNIQUE using index "eixos_prioritarios_codigo_key";

alter table "public"."entrega_participantes" add constraint "entrega_participantes_entrega_id_fkey" FOREIGN KEY (entrega_id) REFERENCES public.entregas(id) ON DELETE CASCADE not valid;

alter table "public"."entrega_participantes" validate constraint "entrega_participantes_entrega_id_fkey";

alter table "public"."entrega_participantes" add constraint "entrega_participantes_setor_id_fkey" FOREIGN KEY (setor_id) REFERENCES public.setores(id) not valid;

alter table "public"."entrega_participantes" validate constraint "entrega_participantes_setor_id_fkey";

alter table "public"."entrega_participantes" add constraint "entrega_participantes_tipo_participante_check" CHECK ((tipo_participante = ANY (ARRAY['setor'::text, 'externo_subsegop'::text, 'externo_sedec'::text]))) not valid;

alter table "public"."entrega_participantes" validate constraint "entrega_participantes_tipo_participante_check";

alter table "public"."entregas" add constraint "entregas_projeto_id_fkey" FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE not valid;

alter table "public"."entregas" validate constraint "entregas_projeto_id_fkey";

alter table "public"."entregas" add constraint "entregas_status_check" CHECK ((status = ANY (ARRAY['aberta'::text, 'em_andamento'::text, 'aguardando'::text, 'resolvida'::text, 'cancelada'::text]))) not valid;

alter table "public"."entregas" validate constraint "entregas_status_check";

alter table "public"."estrategias" add constraint "estrategias_codigo_key" UNIQUE using index "estrategias_codigo_key";

alter table "public"."estrategias" add constraint "estrategias_objetivo_estrategico_id_fkey" FOREIGN KEY (objetivo_estrategico_id) REFERENCES public.objetivos_estrategicos(id) not valid;

alter table "public"."estrategias" validate constraint "estrategias_objetivo_estrategico_id_fkey";

alter table "public"."ficha_setores" add constraint "ficha_setores_ficha_id_fkey" FOREIGN KEY (ficha_id) REFERENCES public.fichas(id) ON DELETE CASCADE not valid;

alter table "public"."ficha_setores" validate constraint "ficha_setores_ficha_id_fkey";

alter table "public"."ficha_setores" add constraint "ficha_setores_setor_id_fkey" FOREIGN KEY (setor_id) REFERENCES public.setores(id) not valid;

alter table "public"."ficha_setores" validate constraint "ficha_setores_setor_id_fkey";

alter table "public"."ficha_setores" add constraint "ficha_setores_tipo_participacao_check" CHECK ((tipo_participacao = ANY (ARRAY['principal'::text, 'participante'::text, 'aval'::text, 'coordenador'::text, 'superior'::text, 'destaque'::text]))) not valid;

alter table "public"."ficha_setores" validate constraint "ficha_setores_tipo_participacao_check";

alter table "public"."fichas" add constraint "fichas_acao_estrategica_id_fkey" FOREIGN KEY (acao_estrategica_id) REFERENCES public.acoes_estrategicas(id) ON DELETE CASCADE not valid;

alter table "public"."fichas" validate constraint "fichas_acao_estrategica_id_fkey";

alter table "public"."fundamentacao_itens" add constraint "fundamentacao_itens_fundamentacao_id_fkey" FOREIGN KEY (fundamentacao_id) REFERENCES public.fundamentacoes(id) ON DELETE CASCADE not valid;

alter table "public"."fundamentacao_itens" validate constraint "fundamentacao_itens_fundamentacao_id_fkey";

alter table "public"."fundamentacoes" add constraint "fundamentacoes_acao_estrategica_id_fkey" FOREIGN KEY (acao_estrategica_id) REFERENCES public.acoes_estrategicas(id) ON DELETE CASCADE not valid;

alter table "public"."fundamentacoes" validate constraint "fundamentacoes_acao_estrategica_id_fkey";

alter table "public"."fundamentacoes" add constraint "fundamentacoes_acao_estrategica_id_key" UNIQUE using index "fundamentacoes_acao_estrategica_id_key";

alter table "public"."objetivos_estrategicos" add constraint "objetivos_estrategicos_codigo_key" UNIQUE using index "objetivos_estrategicos_codigo_key";

alter table "public"."observacoes" add constraint "observacoes_acao_estrategica_id_fkey" FOREIGN KEY (acao_estrategica_id) REFERENCES public.acoes_estrategicas(id) ON DELETE CASCADE not valid;

alter table "public"."observacoes" validate constraint "observacoes_acao_estrategica_id_fkey";

alter table "public"."observacoes" add constraint "observacoes_autor_id_fkey" FOREIGN KEY (autor_id) REFERENCES public.profiles(id) not valid;

alter table "public"."observacoes" validate constraint "observacoes_autor_id_fkey";

alter table "public"."observacoes" add constraint "observacoes_bloco_check" CHECK ((bloco = ANY (ARRAY['descricao'::text, 'ancoragem'::text, 'destaque'::text, 'panoramico'::text, 'fichas'::text, 'fundamentacao'::text, 'nota_institucional'::text]))) not valid;

alter table "public"."observacoes" validate constraint "observacoes_bloco_check";

alter table "public"."observacoes" add constraint "observacoes_respondido_por_fkey" FOREIGN KEY (respondido_por) REFERENCES public.profiles(id) not valid;

alter table "public"."observacoes" validate constraint "observacoes_respondido_por_fkey";

alter table "public"."observacoes" add constraint "observacoes_status_check" CHECK ((status = ANY (ARRAY['em_analise'::text, 'absorvida'::text, 'indeferida'::text]))) not valid;

alter table "public"."observacoes" validate constraint "observacoes_status_check";

alter table "public"."panoramico_linhas" add constraint "panoramico_linhas_acao_estrategica_id_fkey" FOREIGN KEY (acao_estrategica_id) REFERENCES public.acoes_estrategicas(id) ON DELETE CASCADE not valid;

alter table "public"."panoramico_linhas" validate constraint "panoramico_linhas_acao_estrategica_id_fkey";

alter table "public"."panoramico_setores" add constraint "panoramico_setores_panoramico_linha_id_fkey" FOREIGN KEY (panoramico_linha_id) REFERENCES public.panoramico_linhas(id) ON DELETE CASCADE not valid;

alter table "public"."panoramico_setores" validate constraint "panoramico_setores_panoramico_linha_id_fkey";

alter table "public"."panoramico_setores" add constraint "panoramico_setores_setor_id_fkey" FOREIGN KEY (setor_id) REFERENCES public.setores(id) not valid;

alter table "public"."panoramico_setores" validate constraint "panoramico_setores_setor_id_fkey";

alter table "public"."panoramico_setores" add constraint "panoramico_setores_tipo_participacao_check" CHECK ((tipo_participacao = ANY (ARRAY['principal'::text, 'participante'::text, 'aval'::text, 'coordenador'::text, 'superior'::text, 'destaque'::text]))) not valid;

alter table "public"."panoramico_setores" validate constraint "panoramico_setores_tipo_participacao_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'gestor'::text, 'usuario'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_setor_id_fkey" FOREIGN KEY (setor_id) REFERENCES public.setores(id) not valid;

alter table "public"."profiles" validate constraint "profiles_setor_id_fkey";

alter table "public"."projeto_acoes" add constraint "projeto_acoes_acao_estrategica_id_fkey" FOREIGN KEY (acao_estrategica_id) REFERENCES public.acoes_estrategicas(id) ON DELETE CASCADE not valid;

alter table "public"."projeto_acoes" validate constraint "projeto_acoes_acao_estrategica_id_fkey";

alter table "public"."projeto_acoes" add constraint "projeto_acoes_projeto_id_acao_estrategica_id_key" UNIQUE using index "projeto_acoes_projeto_id_acao_estrategica_id_key";

alter table "public"."projeto_acoes" add constraint "projeto_acoes_projeto_id_fkey" FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE not valid;

alter table "public"."projeto_acoes" validate constraint "projeto_acoes_projeto_id_fkey";

alter table "public"."projetos" add constraint "projetos_criado_por_fkey" FOREIGN KEY (criado_por) REFERENCES public.profiles(id) not valid;

alter table "public"."projetos" validate constraint "projetos_criado_por_fkey";

alter table "public"."projetos" add constraint "projetos_setor_lider_id_fkey" FOREIGN KEY (setor_lider_id) REFERENCES public.setores(id) not valid;

alter table "public"."projetos" validate constraint "projetos_setor_lider_id_fkey";

alter table "public"."setores" add constraint "setores_codigo_key" UNIQUE using index "setores_codigo_key";

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

create or replace view "public"."v_observacoes" as  SELECT o.id,
    o.acao_estrategica_id,
    ae.numero AS acao_numero,
    o.bloco,
    o.conteudo,
    o.autor_nome,
    o.autor_setor,
    o.status,
    o.resposta_admin,
    o.created_at,
    o.respondido_em,
    p_resp.nome AS respondido_por_nome
   FROM ((public.observacoes o
     JOIN public.acoes_estrategicas ae ON ((ae.id = o.acao_estrategica_id)))
     LEFT JOIN public.profiles p_resp ON ((p_resp.id = o.respondido_por)))
  ORDER BY o.created_at DESC;


create or replace view "public"."v_panoramico_completo" as  SELECT ae.numero AS acao_numero,
    pl.ordem,
    pl.setor_display,
    pl.papel,
    pl.sintese_contribuicao,
    pl.nao_faz,
    s.codigo AS setor_atomico,
    ps.tipo_participacao
   FROM (((public.panoramico_linhas pl
     JOIN public.acoes_estrategicas ae ON ((ae.id = pl.acao_estrategica_id)))
     LEFT JOIN public.panoramico_setores ps ON ((ps.panoramico_linha_id = pl.id)))
     LEFT JOIN public.setores s ON ((s.id = ps.setor_id)))
  ORDER BY ae.numero, pl.ordem;


create or replace view "public"."v_projeto_status" as  SELECT id,
    nome,
    setor_lider_id,
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM public.entregas e
              WHERE ((e.projeto_id = p.id) AND (e.status <> ALL (ARRAY['resolvida'::text, 'cancelada'::text])) AND (e.data_final_prevista < CURRENT_DATE)))) THEN 'atrasado'::text
            WHEN (EXISTS ( SELECT 1
               FROM public.entregas e
              WHERE ((e.projeto_id = p.id) AND (e.status <> ALL (ARRAY['resolvida'::text, 'cancelada'::text])) AND (e.data_final_prevista >= CURRENT_DATE) AND (e.data_final_prevista <= (CURRENT_DATE + '15 days'::interval))))) THEN 'proximo'::text
            ELSE 'em_dia'::text
        END AS pontualidade,
    ( SELECT min(e.data_final_prevista) AS min
           FROM public.entregas e
          WHERE ((e.projeto_id = p.id) AND (e.status <> ALL (ARRAY['resolvida'::text, 'cancelada'::text])) AND (e.data_final_prevista >= CURRENT_DATE))) AS proxima_entrega
   FROM public.projetos p;


create or replace view "public"."v_setor_acoes" as  SELECT DISTINCT s.codigo AS setor_codigo,
    s.nome_completo AS setor_nome,
    fs.tipo_participacao,
    ae.numero AS acao_numero,
    ae.nome AS acao_nome,
    f.titulo AS ficha_titulo,
    f.papel AS ficha_papel
   FROM (((public.ficha_setores fs
     JOIN public.fichas f ON ((f.id = fs.ficha_id)))
     JOIN public.acoes_estrategicas ae ON ((ae.id = f.acao_estrategica_id)))
     JOIN public.setores s ON ((s.id = fs.setor_id)))
  ORDER BY s.codigo, ae.numero;


grant delete on table "public"."acoes_estrategicas" to "anon";

grant insert on table "public"."acoes_estrategicas" to "anon";

grant references on table "public"."acoes_estrategicas" to "anon";

grant select on table "public"."acoes_estrategicas" to "anon";

grant trigger on table "public"."acoes_estrategicas" to "anon";

grant truncate on table "public"."acoes_estrategicas" to "anon";

grant update on table "public"."acoes_estrategicas" to "anon";

grant delete on table "public"."acoes_estrategicas" to "authenticated";

grant insert on table "public"."acoes_estrategicas" to "authenticated";

grant references on table "public"."acoes_estrategicas" to "authenticated";

grant select on table "public"."acoes_estrategicas" to "authenticated";

grant trigger on table "public"."acoes_estrategicas" to "authenticated";

grant truncate on table "public"."acoes_estrategicas" to "authenticated";

grant update on table "public"."acoes_estrategicas" to "authenticated";

grant delete on table "public"."acoes_estrategicas" to "service_role";

grant insert on table "public"."acoes_estrategicas" to "service_role";

grant references on table "public"."acoes_estrategicas" to "service_role";

grant select on table "public"."acoes_estrategicas" to "service_role";

grant trigger on table "public"."acoes_estrategicas" to "service_role";

grant truncate on table "public"."acoes_estrategicas" to "service_role";

grant update on table "public"."acoes_estrategicas" to "service_role";

grant delete on table "public"."atividade_participantes" to "anon";

grant insert on table "public"."atividade_participantes" to "anon";

grant references on table "public"."atividade_participantes" to "anon";

grant select on table "public"."atividade_participantes" to "anon";

grant trigger on table "public"."atividade_participantes" to "anon";

grant truncate on table "public"."atividade_participantes" to "anon";

grant update on table "public"."atividade_participantes" to "anon";

grant delete on table "public"."atividade_participantes" to "authenticated";

grant insert on table "public"."atividade_participantes" to "authenticated";

grant references on table "public"."atividade_participantes" to "authenticated";

grant select on table "public"."atividade_participantes" to "authenticated";

grant trigger on table "public"."atividade_participantes" to "authenticated";

grant truncate on table "public"."atividade_participantes" to "authenticated";

grant update on table "public"."atividade_participantes" to "authenticated";

grant delete on table "public"."atividade_participantes" to "service_role";

grant insert on table "public"."atividade_participantes" to "service_role";

grant references on table "public"."atividade_participantes" to "service_role";

grant select on table "public"."atividade_participantes" to "service_role";

grant trigger on table "public"."atividade_participantes" to "service_role";

grant truncate on table "public"."atividade_participantes" to "service_role";

grant update on table "public"."atividade_participantes" to "service_role";

grant delete on table "public"."atividades" to "anon";

grant insert on table "public"."atividades" to "anon";

grant references on table "public"."atividades" to "anon";

grant select on table "public"."atividades" to "anon";

grant trigger on table "public"."atividades" to "anon";

grant truncate on table "public"."atividades" to "anon";

grant update on table "public"."atividades" to "anon";

grant delete on table "public"."atividades" to "authenticated";

grant insert on table "public"."atividades" to "authenticated";

grant references on table "public"."atividades" to "authenticated";

grant select on table "public"."atividades" to "authenticated";

grant trigger on table "public"."atividades" to "authenticated";

grant truncate on table "public"."atividades" to "authenticated";

grant update on table "public"."atividades" to "authenticated";

grant delete on table "public"."atividades" to "service_role";

grant insert on table "public"."atividades" to "service_role";

grant references on table "public"."atividades" to "service_role";

grant select on table "public"."atividades" to "service_role";

grant trigger on table "public"."atividades" to "service_role";

grant truncate on table "public"."atividades" to "service_role";

grant update on table "public"."atividades" to "service_role";

grant delete on table "public"."audit_log" to "anon";

grant insert on table "public"."audit_log" to "anon";

grant references on table "public"."audit_log" to "anon";

grant select on table "public"."audit_log" to "anon";

grant trigger on table "public"."audit_log" to "anon";

grant truncate on table "public"."audit_log" to "anon";

grant update on table "public"."audit_log" to "anon";

grant delete on table "public"."audit_log" to "authenticated";

grant insert on table "public"."audit_log" to "authenticated";

grant references on table "public"."audit_log" to "authenticated";

grant select on table "public"."audit_log" to "authenticated";

grant trigger on table "public"."audit_log" to "authenticated";

grant truncate on table "public"."audit_log" to "authenticated";

grant update on table "public"."audit_log" to "authenticated";

grant delete on table "public"."audit_log" to "service_role";

grant insert on table "public"."audit_log" to "service_role";

grant references on table "public"."audit_log" to "service_role";

grant select on table "public"."audit_log" to "service_role";

grant trigger on table "public"."audit_log" to "service_role";

grant truncate on table "public"."audit_log" to "service_role";

grant update on table "public"."audit_log" to "service_role";

grant delete on table "public"."configuracoes" to "anon";

grant insert on table "public"."configuracoes" to "anon";

grant references on table "public"."configuracoes" to "anon";

grant select on table "public"."configuracoes" to "anon";

grant trigger on table "public"."configuracoes" to "anon";

grant truncate on table "public"."configuracoes" to "anon";

grant update on table "public"."configuracoes" to "anon";

grant delete on table "public"."configuracoes" to "authenticated";

grant insert on table "public"."configuracoes" to "authenticated";

grant references on table "public"."configuracoes" to "authenticated";

grant select on table "public"."configuracoes" to "authenticated";

grant trigger on table "public"."configuracoes" to "authenticated";

grant truncate on table "public"."configuracoes" to "authenticated";

grant update on table "public"."configuracoes" to "authenticated";

grant delete on table "public"."configuracoes" to "service_role";

grant insert on table "public"."configuracoes" to "service_role";

grant references on table "public"."configuracoes" to "service_role";

grant select on table "public"."configuracoes" to "service_role";

grant trigger on table "public"."configuracoes" to "service_role";

grant truncate on table "public"."configuracoes" to "service_role";

grant update on table "public"."configuracoes" to "service_role";

grant delete on table "public"."destaque_linhas" to "anon";

grant insert on table "public"."destaque_linhas" to "anon";

grant references on table "public"."destaque_linhas" to "anon";

grant select on table "public"."destaque_linhas" to "anon";

grant trigger on table "public"."destaque_linhas" to "anon";

grant truncate on table "public"."destaque_linhas" to "anon";

grant update on table "public"."destaque_linhas" to "anon";

grant delete on table "public"."destaque_linhas" to "authenticated";

grant insert on table "public"."destaque_linhas" to "authenticated";

grant references on table "public"."destaque_linhas" to "authenticated";

grant select on table "public"."destaque_linhas" to "authenticated";

grant trigger on table "public"."destaque_linhas" to "authenticated";

grant truncate on table "public"."destaque_linhas" to "authenticated";

grant update on table "public"."destaque_linhas" to "authenticated";

grant delete on table "public"."destaque_linhas" to "service_role";

grant insert on table "public"."destaque_linhas" to "service_role";

grant references on table "public"."destaque_linhas" to "service_role";

grant select on table "public"."destaque_linhas" to "service_role";

grant trigger on table "public"."destaque_linhas" to "service_role";

grant truncate on table "public"."destaque_linhas" to "service_role";

grant update on table "public"."destaque_linhas" to "service_role";

grant delete on table "public"."destaques_estrategicos" to "anon";

grant insert on table "public"."destaques_estrategicos" to "anon";

grant references on table "public"."destaques_estrategicos" to "anon";

grant select on table "public"."destaques_estrategicos" to "anon";

grant trigger on table "public"."destaques_estrategicos" to "anon";

grant truncate on table "public"."destaques_estrategicos" to "anon";

grant update on table "public"."destaques_estrategicos" to "anon";

grant delete on table "public"."destaques_estrategicos" to "authenticated";

grant insert on table "public"."destaques_estrategicos" to "authenticated";

grant references on table "public"."destaques_estrategicos" to "authenticated";

grant select on table "public"."destaques_estrategicos" to "authenticated";

grant trigger on table "public"."destaques_estrategicos" to "authenticated";

grant truncate on table "public"."destaques_estrategicos" to "authenticated";

grant update on table "public"."destaques_estrategicos" to "authenticated";

grant delete on table "public"."destaques_estrategicos" to "service_role";

grant insert on table "public"."destaques_estrategicos" to "service_role";

grant references on table "public"."destaques_estrategicos" to "service_role";

grant select on table "public"."destaques_estrategicos" to "service_role";

grant trigger on table "public"."destaques_estrategicos" to "service_role";

grant truncate on table "public"."destaques_estrategicos" to "service_role";

grant update on table "public"."destaques_estrategicos" to "service_role";

grant delete on table "public"."eixos_prioritarios" to "anon";

grant insert on table "public"."eixos_prioritarios" to "anon";

grant references on table "public"."eixos_prioritarios" to "anon";

grant select on table "public"."eixos_prioritarios" to "anon";

grant trigger on table "public"."eixos_prioritarios" to "anon";

grant truncate on table "public"."eixos_prioritarios" to "anon";

grant update on table "public"."eixos_prioritarios" to "anon";

grant delete on table "public"."eixos_prioritarios" to "authenticated";

grant insert on table "public"."eixos_prioritarios" to "authenticated";

grant references on table "public"."eixos_prioritarios" to "authenticated";

grant select on table "public"."eixos_prioritarios" to "authenticated";

grant trigger on table "public"."eixos_prioritarios" to "authenticated";

grant truncate on table "public"."eixos_prioritarios" to "authenticated";

grant update on table "public"."eixos_prioritarios" to "authenticated";

grant delete on table "public"."eixos_prioritarios" to "service_role";

grant insert on table "public"."eixos_prioritarios" to "service_role";

grant references on table "public"."eixos_prioritarios" to "service_role";

grant select on table "public"."eixos_prioritarios" to "service_role";

grant trigger on table "public"."eixos_prioritarios" to "service_role";

grant truncate on table "public"."eixos_prioritarios" to "service_role";

grant update on table "public"."eixos_prioritarios" to "service_role";

grant delete on table "public"."entrega_participantes" to "anon";

grant insert on table "public"."entrega_participantes" to "anon";

grant references on table "public"."entrega_participantes" to "anon";

grant select on table "public"."entrega_participantes" to "anon";

grant trigger on table "public"."entrega_participantes" to "anon";

grant truncate on table "public"."entrega_participantes" to "anon";

grant update on table "public"."entrega_participantes" to "anon";

grant delete on table "public"."entrega_participantes" to "authenticated";

grant insert on table "public"."entrega_participantes" to "authenticated";

grant references on table "public"."entrega_participantes" to "authenticated";

grant select on table "public"."entrega_participantes" to "authenticated";

grant trigger on table "public"."entrega_participantes" to "authenticated";

grant truncate on table "public"."entrega_participantes" to "authenticated";

grant update on table "public"."entrega_participantes" to "authenticated";

grant delete on table "public"."entrega_participantes" to "service_role";

grant insert on table "public"."entrega_participantes" to "service_role";

grant references on table "public"."entrega_participantes" to "service_role";

grant select on table "public"."entrega_participantes" to "service_role";

grant trigger on table "public"."entrega_participantes" to "service_role";

grant truncate on table "public"."entrega_participantes" to "service_role";

grant update on table "public"."entrega_participantes" to "service_role";

grant delete on table "public"."entregas" to "anon";

grant insert on table "public"."entregas" to "anon";

grant references on table "public"."entregas" to "anon";

grant select on table "public"."entregas" to "anon";

grant trigger on table "public"."entregas" to "anon";

grant truncate on table "public"."entregas" to "anon";

grant update on table "public"."entregas" to "anon";

grant delete on table "public"."entregas" to "authenticated";

grant insert on table "public"."entregas" to "authenticated";

grant references on table "public"."entregas" to "authenticated";

grant select on table "public"."entregas" to "authenticated";

grant trigger on table "public"."entregas" to "authenticated";

grant truncate on table "public"."entregas" to "authenticated";

grant update on table "public"."entregas" to "authenticated";

grant delete on table "public"."entregas" to "service_role";

grant insert on table "public"."entregas" to "service_role";

grant references on table "public"."entregas" to "service_role";

grant select on table "public"."entregas" to "service_role";

grant trigger on table "public"."entregas" to "service_role";

grant truncate on table "public"."entregas" to "service_role";

grant update on table "public"."entregas" to "service_role";

grant delete on table "public"."estrategias" to "anon";

grant insert on table "public"."estrategias" to "anon";

grant references on table "public"."estrategias" to "anon";

grant select on table "public"."estrategias" to "anon";

grant trigger on table "public"."estrategias" to "anon";

grant truncate on table "public"."estrategias" to "anon";

grant update on table "public"."estrategias" to "anon";

grant delete on table "public"."estrategias" to "authenticated";

grant insert on table "public"."estrategias" to "authenticated";

grant references on table "public"."estrategias" to "authenticated";

grant select on table "public"."estrategias" to "authenticated";

grant trigger on table "public"."estrategias" to "authenticated";

grant truncate on table "public"."estrategias" to "authenticated";

grant update on table "public"."estrategias" to "authenticated";

grant delete on table "public"."estrategias" to "service_role";

grant insert on table "public"."estrategias" to "service_role";

grant references on table "public"."estrategias" to "service_role";

grant select on table "public"."estrategias" to "service_role";

grant trigger on table "public"."estrategias" to "service_role";

grant truncate on table "public"."estrategias" to "service_role";

grant update on table "public"."estrategias" to "service_role";

grant delete on table "public"."ficha_setores" to "anon";

grant insert on table "public"."ficha_setores" to "anon";

grant references on table "public"."ficha_setores" to "anon";

grant select on table "public"."ficha_setores" to "anon";

grant trigger on table "public"."ficha_setores" to "anon";

grant truncate on table "public"."ficha_setores" to "anon";

grant update on table "public"."ficha_setores" to "anon";

grant delete on table "public"."ficha_setores" to "authenticated";

grant insert on table "public"."ficha_setores" to "authenticated";

grant references on table "public"."ficha_setores" to "authenticated";

grant select on table "public"."ficha_setores" to "authenticated";

grant trigger on table "public"."ficha_setores" to "authenticated";

grant truncate on table "public"."ficha_setores" to "authenticated";

grant update on table "public"."ficha_setores" to "authenticated";

grant delete on table "public"."ficha_setores" to "service_role";

grant insert on table "public"."ficha_setores" to "service_role";

grant references on table "public"."ficha_setores" to "service_role";

grant select on table "public"."ficha_setores" to "service_role";

grant trigger on table "public"."ficha_setores" to "service_role";

grant truncate on table "public"."ficha_setores" to "service_role";

grant update on table "public"."ficha_setores" to "service_role";

grant delete on table "public"."fichas" to "anon";

grant insert on table "public"."fichas" to "anon";

grant references on table "public"."fichas" to "anon";

grant select on table "public"."fichas" to "anon";

grant trigger on table "public"."fichas" to "anon";

grant truncate on table "public"."fichas" to "anon";

grant update on table "public"."fichas" to "anon";

grant delete on table "public"."fichas" to "authenticated";

grant insert on table "public"."fichas" to "authenticated";

grant references on table "public"."fichas" to "authenticated";

grant select on table "public"."fichas" to "authenticated";

grant trigger on table "public"."fichas" to "authenticated";

grant truncate on table "public"."fichas" to "authenticated";

grant update on table "public"."fichas" to "authenticated";

grant delete on table "public"."fichas" to "service_role";

grant insert on table "public"."fichas" to "service_role";

grant references on table "public"."fichas" to "service_role";

grant select on table "public"."fichas" to "service_role";

grant trigger on table "public"."fichas" to "service_role";

grant truncate on table "public"."fichas" to "service_role";

grant update on table "public"."fichas" to "service_role";

grant delete on table "public"."fundamentacao_itens" to "anon";

grant insert on table "public"."fundamentacao_itens" to "anon";

grant references on table "public"."fundamentacao_itens" to "anon";

grant select on table "public"."fundamentacao_itens" to "anon";

grant trigger on table "public"."fundamentacao_itens" to "anon";

grant truncate on table "public"."fundamentacao_itens" to "anon";

grant update on table "public"."fundamentacao_itens" to "anon";

grant delete on table "public"."fundamentacao_itens" to "authenticated";

grant insert on table "public"."fundamentacao_itens" to "authenticated";

grant references on table "public"."fundamentacao_itens" to "authenticated";

grant select on table "public"."fundamentacao_itens" to "authenticated";

grant trigger on table "public"."fundamentacao_itens" to "authenticated";

grant truncate on table "public"."fundamentacao_itens" to "authenticated";

grant update on table "public"."fundamentacao_itens" to "authenticated";

grant delete on table "public"."fundamentacao_itens" to "service_role";

grant insert on table "public"."fundamentacao_itens" to "service_role";

grant references on table "public"."fundamentacao_itens" to "service_role";

grant select on table "public"."fundamentacao_itens" to "service_role";

grant trigger on table "public"."fundamentacao_itens" to "service_role";

grant truncate on table "public"."fundamentacao_itens" to "service_role";

grant update on table "public"."fundamentacao_itens" to "service_role";

grant delete on table "public"."fundamentacoes" to "anon";

grant insert on table "public"."fundamentacoes" to "anon";

grant references on table "public"."fundamentacoes" to "anon";

grant select on table "public"."fundamentacoes" to "anon";

grant trigger on table "public"."fundamentacoes" to "anon";

grant truncate on table "public"."fundamentacoes" to "anon";

grant update on table "public"."fundamentacoes" to "anon";

grant delete on table "public"."fundamentacoes" to "authenticated";

grant insert on table "public"."fundamentacoes" to "authenticated";

grant references on table "public"."fundamentacoes" to "authenticated";

grant select on table "public"."fundamentacoes" to "authenticated";

grant trigger on table "public"."fundamentacoes" to "authenticated";

grant truncate on table "public"."fundamentacoes" to "authenticated";

grant update on table "public"."fundamentacoes" to "authenticated";

grant delete on table "public"."fundamentacoes" to "service_role";

grant insert on table "public"."fundamentacoes" to "service_role";

grant references on table "public"."fundamentacoes" to "service_role";

grant select on table "public"."fundamentacoes" to "service_role";

grant trigger on table "public"."fundamentacoes" to "service_role";

grant truncate on table "public"."fundamentacoes" to "service_role";

grant update on table "public"."fundamentacoes" to "service_role";

grant delete on table "public"."objetivos_estrategicos" to "anon";

grant insert on table "public"."objetivos_estrategicos" to "anon";

grant references on table "public"."objetivos_estrategicos" to "anon";

grant select on table "public"."objetivos_estrategicos" to "anon";

grant trigger on table "public"."objetivos_estrategicos" to "anon";

grant truncate on table "public"."objetivos_estrategicos" to "anon";

grant update on table "public"."objetivos_estrategicos" to "anon";

grant delete on table "public"."objetivos_estrategicos" to "authenticated";

grant insert on table "public"."objetivos_estrategicos" to "authenticated";

grant references on table "public"."objetivos_estrategicos" to "authenticated";

grant select on table "public"."objetivos_estrategicos" to "authenticated";

grant trigger on table "public"."objetivos_estrategicos" to "authenticated";

grant truncate on table "public"."objetivos_estrategicos" to "authenticated";

grant update on table "public"."objetivos_estrategicos" to "authenticated";

grant delete on table "public"."objetivos_estrategicos" to "service_role";

grant insert on table "public"."objetivos_estrategicos" to "service_role";

grant references on table "public"."objetivos_estrategicos" to "service_role";

grant select on table "public"."objetivos_estrategicos" to "service_role";

grant trigger on table "public"."objetivos_estrategicos" to "service_role";

grant truncate on table "public"."objetivos_estrategicos" to "service_role";

grant update on table "public"."objetivos_estrategicos" to "service_role";

grant delete on table "public"."observacoes" to "anon";

grant insert on table "public"."observacoes" to "anon";

grant references on table "public"."observacoes" to "anon";

grant select on table "public"."observacoes" to "anon";

grant trigger on table "public"."observacoes" to "anon";

grant truncate on table "public"."observacoes" to "anon";

grant update on table "public"."observacoes" to "anon";

grant delete on table "public"."observacoes" to "authenticated";

grant insert on table "public"."observacoes" to "authenticated";

grant references on table "public"."observacoes" to "authenticated";

grant select on table "public"."observacoes" to "authenticated";

grant trigger on table "public"."observacoes" to "authenticated";

grant truncate on table "public"."observacoes" to "authenticated";

grant update on table "public"."observacoes" to "authenticated";

grant delete on table "public"."observacoes" to "service_role";

grant insert on table "public"."observacoes" to "service_role";

grant references on table "public"."observacoes" to "service_role";

grant select on table "public"."observacoes" to "service_role";

grant trigger on table "public"."observacoes" to "service_role";

grant truncate on table "public"."observacoes" to "service_role";

grant update on table "public"."observacoes" to "service_role";

grant delete on table "public"."panoramico_linhas" to "anon";

grant insert on table "public"."panoramico_linhas" to "anon";

grant references on table "public"."panoramico_linhas" to "anon";

grant select on table "public"."panoramico_linhas" to "anon";

grant trigger on table "public"."panoramico_linhas" to "anon";

grant truncate on table "public"."panoramico_linhas" to "anon";

grant update on table "public"."panoramico_linhas" to "anon";

grant delete on table "public"."panoramico_linhas" to "authenticated";

grant insert on table "public"."panoramico_linhas" to "authenticated";

grant references on table "public"."panoramico_linhas" to "authenticated";

grant select on table "public"."panoramico_linhas" to "authenticated";

grant trigger on table "public"."panoramico_linhas" to "authenticated";

grant truncate on table "public"."panoramico_linhas" to "authenticated";

grant update on table "public"."panoramico_linhas" to "authenticated";

grant delete on table "public"."panoramico_linhas" to "service_role";

grant insert on table "public"."panoramico_linhas" to "service_role";

grant references on table "public"."panoramico_linhas" to "service_role";

grant select on table "public"."panoramico_linhas" to "service_role";

grant trigger on table "public"."panoramico_linhas" to "service_role";

grant truncate on table "public"."panoramico_linhas" to "service_role";

grant update on table "public"."panoramico_linhas" to "service_role";

grant delete on table "public"."panoramico_setores" to "anon";

grant insert on table "public"."panoramico_setores" to "anon";

grant references on table "public"."panoramico_setores" to "anon";

grant select on table "public"."panoramico_setores" to "anon";

grant trigger on table "public"."panoramico_setores" to "anon";

grant truncate on table "public"."panoramico_setores" to "anon";

grant update on table "public"."panoramico_setores" to "anon";

grant delete on table "public"."panoramico_setores" to "authenticated";

grant insert on table "public"."panoramico_setores" to "authenticated";

grant references on table "public"."panoramico_setores" to "authenticated";

grant select on table "public"."panoramico_setores" to "authenticated";

grant trigger on table "public"."panoramico_setores" to "authenticated";

grant truncate on table "public"."panoramico_setores" to "authenticated";

grant update on table "public"."panoramico_setores" to "authenticated";

grant delete on table "public"."panoramico_setores" to "service_role";

grant insert on table "public"."panoramico_setores" to "service_role";

grant references on table "public"."panoramico_setores" to "service_role";

grant select on table "public"."panoramico_setores" to "service_role";

grant trigger on table "public"."panoramico_setores" to "service_role";

grant truncate on table "public"."panoramico_setores" to "service_role";

grant update on table "public"."panoramico_setores" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."projeto_acoes" to "anon";

grant insert on table "public"."projeto_acoes" to "anon";

grant references on table "public"."projeto_acoes" to "anon";

grant select on table "public"."projeto_acoes" to "anon";

grant trigger on table "public"."projeto_acoes" to "anon";

grant truncate on table "public"."projeto_acoes" to "anon";

grant update on table "public"."projeto_acoes" to "anon";

grant delete on table "public"."projeto_acoes" to "authenticated";

grant insert on table "public"."projeto_acoes" to "authenticated";

grant references on table "public"."projeto_acoes" to "authenticated";

grant select on table "public"."projeto_acoes" to "authenticated";

grant trigger on table "public"."projeto_acoes" to "authenticated";

grant truncate on table "public"."projeto_acoes" to "authenticated";

grant update on table "public"."projeto_acoes" to "authenticated";

grant delete on table "public"."projeto_acoes" to "service_role";

grant insert on table "public"."projeto_acoes" to "service_role";

grant references on table "public"."projeto_acoes" to "service_role";

grant select on table "public"."projeto_acoes" to "service_role";

grant trigger on table "public"."projeto_acoes" to "service_role";

grant truncate on table "public"."projeto_acoes" to "service_role";

grant update on table "public"."projeto_acoes" to "service_role";

grant delete on table "public"."projetos" to "anon";

grant insert on table "public"."projetos" to "anon";

grant references on table "public"."projetos" to "anon";

grant select on table "public"."projetos" to "anon";

grant trigger on table "public"."projetos" to "anon";

grant truncate on table "public"."projetos" to "anon";

grant update on table "public"."projetos" to "anon";

grant delete on table "public"."projetos" to "authenticated";

grant insert on table "public"."projetos" to "authenticated";

grant references on table "public"."projetos" to "authenticated";

grant select on table "public"."projetos" to "authenticated";

grant trigger on table "public"."projetos" to "authenticated";

grant truncate on table "public"."projetos" to "authenticated";

grant update on table "public"."projetos" to "authenticated";

grant delete on table "public"."projetos" to "service_role";

grant insert on table "public"."projetos" to "service_role";

grant references on table "public"."projetos" to "service_role";

grant select on table "public"."projetos" to "service_role";

grant trigger on table "public"."projetos" to "service_role";

grant truncate on table "public"."projetos" to "service_role";

grant update on table "public"."projetos" to "service_role";

grant delete on table "public"."setores" to "anon";

grant insert on table "public"."setores" to "anon";

grant references on table "public"."setores" to "anon";

grant select on table "public"."setores" to "anon";

grant trigger on table "public"."setores" to "anon";

grant truncate on table "public"."setores" to "anon";

grant update on table "public"."setores" to "anon";

grant delete on table "public"."setores" to "authenticated";

grant insert on table "public"."setores" to "authenticated";

grant references on table "public"."setores" to "authenticated";

grant select on table "public"."setores" to "authenticated";

grant trigger on table "public"."setores" to "authenticated";

grant truncate on table "public"."setores" to "authenticated";

grant update on table "public"."setores" to "authenticated";

grant delete on table "public"."setores" to "service_role";

grant insert on table "public"."setores" to "service_role";

grant references on table "public"."setores" to "service_role";

grant select on table "public"."setores" to "service_role";

grant trigger on table "public"."setores" to "service_role";

grant truncate on table "public"."setores" to "service_role";

grant update on table "public"."setores" to "service_role";


  create policy "admin_acoes"
  on "public"."acoes_estrategicas"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "ae_update_admin"
  on "public"."acoes_estrategicas"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "leitura_publica_acoes"
  on "public"."acoes_estrategicas"
  as permissive
  for select
  to public
using (true);



  create policy "ap_admin"
  on "public"."atividade_participantes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "ap_gestor"
  on "public"."atividade_participantes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.atividades a
     JOIN public.entregas e ON ((e.id = a.entrega_id)))
     JOIN public.projetos p ON ((p.id = e.projeto_id)))
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((a.id = atividade_participantes.atividade_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))))
with check ((EXISTS ( SELECT 1
   FROM (((public.atividades a
     JOIN public.entregas e ON ((e.id = a.entrega_id)))
     JOIN public.projetos p ON ((p.id = e.projeto_id)))
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((a.id = atividade_participantes.atividade_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))));



  create policy "ap_select"
  on "public"."atividade_participantes"
  as permissive
  for select
  to authenticated
using (true);



  create policy "ativ_admin"
  on "public"."atividades"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "ativ_gestor"
  on "public"."atividades"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.entregas e
     JOIN public.projetos p ON ((p.id = e.projeto_id)))
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((e.id = atividades.entrega_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))))
with check ((EXISTS ( SELECT 1
   FROM ((public.entregas e
     JOIN public.projetos p ON ((p.id = e.projeto_id)))
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((e.id = atividades.entrega_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))));



  create policy "ativ_select"
  on "public"."atividades"
  as permissive
  for select
  to authenticated
using (true);



  create policy "audit_admin"
  on "public"."audit_log"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "audit_gestor_insert"
  on "public"."audit_log"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'gestor'::text]))))));



  create policy "audit_select_admin"
  on "public"."audit_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "config_admin_all"
  on "public"."configuracoes"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "config_select"
  on "public"."configuracoes"
  as permissive
  for select
  to authenticated
using (true);



  create policy "config_select_anon"
  on "public"."configuracoes"
  as permissive
  for select
  to anon
using (true);



  create policy "config_update_admin"
  on "public"."configuracoes"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "admin_dest_linhas"
  on "public"."destaque_linhas"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "dest_linhas_update_admin"
  on "public"."destaque_linhas"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "leitura_publica_dest_linhas"
  on "public"."destaque_linhas"
  as permissive
  for select
  to public
using (true);



  create policy "admin_destaques"
  on "public"."destaques_estrategicos"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "dest_update_admin"
  on "public"."destaques_estrategicos"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "leitura_publica_destaques"
  on "public"."destaques_estrategicos"
  as permissive
  for select
  to public
using (true);



  create policy "admin_eixos"
  on "public"."eixos_prioritarios"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_eixos"
  on "public"."eixos_prioritarios"
  as permissive
  for select
  to public
using (true);



  create policy "ep_admin"
  on "public"."entrega_participantes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "ep_gestor"
  on "public"."entrega_participantes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.entregas e
     JOIN public.projetos p ON ((p.id = e.projeto_id)))
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((e.id = entrega_participantes.entrega_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))))
with check ((EXISTS ( SELECT 1
   FROM ((public.entregas e
     JOIN public.projetos p ON ((p.id = e.projeto_id)))
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((e.id = entrega_participantes.entrega_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))));



  create policy "ep_select"
  on "public"."entrega_participantes"
  as permissive
  for select
  to authenticated
using (true);



  create policy "ent_admin"
  on "public"."entregas"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "ent_gestor"
  on "public"."entregas"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.projetos p
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((p.id = entregas.projeto_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))))
with check ((EXISTS ( SELECT 1
   FROM (public.projetos p
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((p.id = entregas.projeto_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))));



  create policy "ent_select"
  on "public"."entregas"
  as permissive
  for select
  to authenticated
using (true);



  create policy "admin_estrategias"
  on "public"."estrategias"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_estrategias"
  on "public"."estrategias"
  as permissive
  for select
  to public
using (true);



  create policy "admin_ficha_setores"
  on "public"."ficha_setores"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_ficha_setores"
  on "public"."ficha_setores"
  as permissive
  for select
  to public
using (true);



  create policy "admin_fichas"
  on "public"."fichas"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "fichas_update_admin"
  on "public"."fichas"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "leitura_publica_fichas"
  on "public"."fichas"
  as permissive
  for select
  to public
using (true);



  create policy "admin_fund_itens"
  on "public"."fundamentacao_itens"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "fund_itens_update_admin"
  on "public"."fundamentacao_itens"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "leitura_publica_fund_itens"
  on "public"."fundamentacao_itens"
  as permissive
  for select
  to public
using (true);



  create policy "admin_fundamentacoes"
  on "public"."fundamentacoes"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "fund_update_admin"
  on "public"."fundamentacoes"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "leitura_publica_fundamentacoes"
  on "public"."fundamentacoes"
  as permissive
  for select
  to public
using (true);



  create policy "admin_objetivos"
  on "public"."objetivos_estrategicos"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_objetivos"
  on "public"."objetivos_estrategicos"
  as permissive
  for select
  to public
using (true);



  create policy "obs_admin"
  on "public"."observacoes"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "obs_delete_own"
  on "public"."observacoes"
  as permissive
  for delete
  to authenticated
using (((autor_id = auth.uid()) AND (status = 'em_analise'::text)));



  create policy "obs_insert"
  on "public"."observacoes"
  as permissive
  for insert
  to authenticated
with check ((autor_id = auth.uid()));



  create policy "obs_select"
  on "public"."observacoes"
  as permissive
  for select
  to authenticated
using (true);



  create policy "obs_update_admin"
  on "public"."observacoes"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'gestor'::text]))))));



  create policy "obs_update_own"
  on "public"."observacoes"
  as permissive
  for update
  to authenticated
using (((autor_id = auth.uid()) AND (status = 'em_analise'::text)));



  create policy "admin_panoramico"
  on "public"."panoramico_linhas"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_panoramico"
  on "public"."panoramico_linhas"
  as permissive
  for select
  to public
using (true);



  create policy "pan_update_admin"
  on "public"."panoramico_linhas"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "admin_pan_setores"
  on "public"."panoramico_setores"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_pan_setores"
  on "public"."panoramico_setores"
  as permissive
  for select
  to public
using (true);



  create policy "profiles_admin"
  on "public"."profiles"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "profiles_select"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "profiles_update_admin"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles profiles_1
  WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.role = 'admin'::text)))));



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((id = auth.uid()));



  create policy "pa_admin"
  on "public"."projeto_acoes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "pa_gestor"
  on "public"."projeto_acoes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.projetos p
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((p.id = projeto_acoes.projeto_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))))
with check ((EXISTS ( SELECT 1
   FROM (public.projetos p
     JOIN public.profiles pr ON ((pr.id = auth.uid())))
  WHERE ((p.id = projeto_acoes.projeto_id) AND (pr.role = 'gestor'::text) AND (pr.setor_id = p.setor_lider_id)))));



  create policy "pa_select"
  on "public"."projeto_acoes"
  as permissive
  for select
  to authenticated
using (true);



  create policy "proj_admin"
  on "public"."projetos"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "proj_gestor_delete"
  on "public"."projetos"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'gestor'::text) AND (profiles.setor_id = projetos.setor_lider_id)))));



  create policy "proj_gestor_insert"
  on "public"."projetos"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'gestor'::text) AND (profiles.setor_id = projetos.setor_lider_id)))));



  create policy "proj_gestor_update"
  on "public"."projetos"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'gestor'::text) AND (profiles.setor_id = projetos.setor_lider_id)))));



  create policy "proj_select"
  on "public"."projetos"
  as permissive
  for select
  to authenticated
using (true);



  create policy "admin_setores"
  on "public"."setores"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "leitura_publica_setores"
  on "public"."setores"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER tr_acoes_updated BEFORE UPDATE ON public.acoes_estrategicas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_atividades_updated BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_config_updated BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_entregas_updated BEFORE UPDATE ON public.entregas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_observacoes_updated BEFORE UPDATE ON public.observacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_projetos_updated BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



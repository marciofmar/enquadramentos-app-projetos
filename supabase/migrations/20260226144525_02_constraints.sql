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


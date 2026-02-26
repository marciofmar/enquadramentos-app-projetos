create or replace view "public"."v_observacoes" as SELECT o.id,
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
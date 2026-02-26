create or replace view "public"."v_panoramico_completo" as SELECT ae.numero AS acao_numero,
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
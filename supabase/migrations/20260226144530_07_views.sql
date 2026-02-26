create or replace view "public"."v_setor_acoes" as SELECT DISTINCT s.codigo AS setor_codigo,
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
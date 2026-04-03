select
  ae.numero,
  ae.nome,
  ep.nome as eixo,
  oe.nome as objetivo_estrategico,
  e.nome as estrategia,
  ae.descricao_o_que,
  ae.descricao_para_que,
  ae.ancoragem,
  ae.nota_arranjo_institucional,
  ae.acoes_conectadas,
  ae.versao,
  ae.data_elaboracao,
  -- Destaque Estratégico
  de.titulo as destaque_titulo,
  de.header_contexto as destaque_header_contexto,
  (
    select
      json_agg(
        json_build_object(
          'ordem',
          dl.ordem,
          'tipo',
          dl.tipo,
          'label',
          dl.label,
          'conteudo',
          dl.conteudo
        )
        order by
          dl.ordem
      )
    from
      destaque_linhas dl
    where
      dl.destaque_id = de.id
  ) as destaque_linhas,
  -- Quadro Panorâmico
  (
    select
      json_agg(
        json_build_object(
          'ordem',
          pl.ordem,
          'setor',
          pl.setor_display,
          'papel',
          pl.papel,
          'sintese',
          pl.sintese_contribuicao,
          'nao_faz',
          pl.nao_faz
        )
        order by
          pl.ordem
      )
    from
      panoramico_linhas pl
    where
      pl.acao_estrategica_id = ae.id
  ) as panoramico,
  -- Fichas Detalhadas
  (
    select
      json_agg(
        json_build_object(
          'ordem',
          f.ordem,
          'titulo',
          f.titulo,
          'setor',
          f.setor_display,
          'papel',
          f.papel,
          'justificativa',
          f.justificativa,
          'contribuicao_esperada',
          f.contribuicao_esperada,
          'nao_escopo',
          f.nao_escopo,
          'dependencias_criticas',
          f.dependencias_criticas
        )
        order by
          f.ordem
      )
    from
      fichas f
    where
      f.acao_estrategica_id = ae.id
  ) as fichas,
  -- Fundamentação
  fun.introducao as fundamentacao_introducao,
  (
    select
      json_agg(
        json_build_object('ordem', fi.ordem, 'conteudo', fi.conteudo)
        order by
          fi.ordem
      )
    from
      fundamentacao_itens fi
    where
      fi.fundamentacao_id = fun.id
  ) as fundamentacao_itens,
  fun.conclusao as fundamentacao_conclusao
from
  acoes_estrategicas ae
  left join eixos_prioritarios ep on ep.id = ae.eixo_prioritario_id
  left join objetivos_estrategicos oe on oe.id = ae.objetivo_estrategico_id
  left join estrategias e on e.id = ae.estrategia_id
  left join destaques_estrategicos de on de.acao_estrategica_id = ae.id
  left join fundamentacoes fun on fun.acao_estrategica_id = ae.id
where
  ae.visivel_enquadramento = true
order by
  ae.numero;
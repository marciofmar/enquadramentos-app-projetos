-- Fase 5: Fluxo de aprovação de edições/exclusões

CREATE TABLE IF NOT EXISTS solicitacoes_alteracao (
  id serial PRIMARY KEY,
  solicitante_id uuid NOT NULL REFERENCES profiles(id),
  solicitante_nome text NOT NULL,
  tipo_entidade text NOT NULL CHECK (tipo_entidade IN ('projeto', 'entrega', 'atividade')),
  entidade_id integer NOT NULL,
  entidade_nome text NOT NULL,
  projeto_id integer NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  tipo_operacao text NOT NULL CHECK (tipo_operacao IN ('edicao', 'exclusao')),
  dados_alteracao jsonb,
  status text NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'deferida', 'indeferida', 'cancelada')),
  avaliador_id uuid REFERENCES profiles(id),
  avaliador_nome text,
  justificativa_avaliador text,
  avaliado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE solicitacoes_alteracao ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler (para ver status da sua solicitação)
CREATE POLICY sol_select ON solicitacoes_alteracao FOR SELECT USING (true);

-- Gestores podem criar solicitações
CREATE POLICY sol_insert ON solicitacoes_alteracao FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master', 'gestor'))
);

-- Admin e master podem atualizar (deferir/indeferir)
CREATE POLICY sol_update_admin ON solicitacoes_alteracao FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master'))
);

-- Solicitante pode atualizar sua própria solicitação (para cancelar)
CREATE POLICY sol_update_own ON solicitacoes_alteracao FOR UPDATE USING (
  solicitante_id = auth.uid()
);

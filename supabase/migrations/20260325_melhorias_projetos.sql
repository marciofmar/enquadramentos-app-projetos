-- ============================================================
-- Migracao: Melhorias do Modulo de Projetos
-- 1.1 Status hibernando para projetos
-- 1.2 Tabela de indicadores (1:N com projetos)
-- 1.3 Expandir tipos de alerta
-- 1.4 AEs especiais + coluna visivel_enquadramento
-- ============================================================

-- ============================================================
-- 1.1 STATUS HIBERNANDO PARA PROJETOS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projetos' AND column_name = 'status'
  ) THEN
    ALTER TABLE projetos ADD COLUMN status TEXT DEFAULT 'ativo';
    ALTER TABLE projetos ADD CONSTRAINT projetos_status_check CHECK (status IN ('ativo', 'hibernando'));
  END IF;
END $$;

-- ============================================================
-- 1.2 TABELA DE INDICADORES (1:N com projetos)
-- ============================================================

CREATE TABLE IF NOT EXISTS indicadores (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome TEXT,
  formula TEXT,
  fonte_dados TEXT,
  periodicidade TEXT,
  unidade_medida TEXT,
  responsavel TEXT,
  meta TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indicadores_projeto ON indicadores(projeto_id);

ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS indicadores_select ON indicadores;
CREATE POLICY indicadores_select ON indicadores FOR SELECT USING (true);

DROP POLICY IF EXISTS indicadores_insert ON indicadores;
CREATE POLICY indicadores_insert ON indicadores FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS indicadores_update ON indicadores;
CREATE POLICY indicadores_update ON indicadores FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS indicadores_delete ON indicadores;
CREATE POLICY indicadores_delete ON indicadores FOR DELETE TO authenticated USING (true);

-- Migrar dados existentes de indicador_sucesso para a nova tabela
INSERT INTO indicadores (projeto_id, nome)
SELECT id, indicador_sucesso FROM projetos
WHERE indicador_sucesso IS NOT NULL AND indicador_sucesso != ''
AND NOT EXISTS (SELECT 1 FROM indicadores WHERE indicadores.projeto_id = projetos.id);

-- ============================================================
-- 1.3 EXPANDIR TIPOS DE ALERTA
-- ============================================================

ALTER TABLE alertas DROP CONSTRAINT IF EXISTS alertas_tipo_check;
ALTER TABLE alertas ADD CONSTRAINT alertas_tipo_check CHECK (tipo IN (
  'edicao_projeto','edicao_entrega','exclusao_entrega','edicao_atividade','exclusao_atividade',
  'alteracao_setor_entrega','alteracao_setor_lider',
  'criacao_projeto','criacao_entrega','criacao_atividade',
  'nomeacao_lider','nomeacao_responsavel_entrega','nomeacao_responsavel_atividade',
  'nomeacao_participante'
));

-- Expandir entidade para incluir 'projeto' (ja deve estar, mas garantir)
ALTER TABLE alertas DROP CONSTRAINT IF EXISTS alertas_entidade_check;
ALTER TABLE alertas ADD CONSTRAINT alertas_entidade_check
  CHECK (entidade IN ('entrega','atividade','projeto'));

-- Ajustar RLS: permitir que qualquer authenticated user insira alertas
DROP POLICY IF EXISTS alerta_insert ON alertas;
CREATE POLICY alerta_insert ON alertas FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 1.4 AEs ESPECIAIS + COLUNA visivel_enquadramento
-- ============================================================

ALTER TABLE acoes_estrategicas ADD COLUMN IF NOT EXISTS visivel_enquadramento BOOLEAN DEFAULT true;

INSERT INTO acoes_estrategicas (numero, nome, visivel_enquadramento)
VALUES ('CAML', 'Projetos da Coordenadoria de Apoio à Medicina Legal', false)
ON CONFLICT (numero) DO NOTHING;

INSERT INTO acoes_estrategicas (numero, nome, visivel_enquadramento)
VALUES ('Coringa', 'Fora de enquadramento', false)
ON CONFLICT (numero) DO NOTHING;

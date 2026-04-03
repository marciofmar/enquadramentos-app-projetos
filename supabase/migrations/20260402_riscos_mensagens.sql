-- ============================================================
-- Migração: Matriz de Riscos + Sistema de Mensagens de Projeto
-- Data: 2026-04-02
-- ============================================================

-- 1. Tabela de riscos (espelho de indicadores)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS riscos (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  natureza TEXT,
  probabilidade TEXT CHECK (probabilidade IN ('baixa','media','alta')),
  medida_resposta TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riscos_projeto ON riscos(projeto_id);

ALTER TABLE riscos ENABLE ROW LEVEL SECURITY;

CREATE POLICY riscos_select ON riscos FOR SELECT TO authenticated USING (true);
CREATE POLICY riscos_insert ON riscos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY riscos_update ON riscos FOR UPDATE TO authenticated USING (true);
CREATE POLICY riscos_delete ON riscos FOR DELETE TO authenticated USING (true);

-- 2. Tabela de mensagens de projeto
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagens_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_projeto_projeto ON mensagens_projeto(projeto_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_projeto_autor ON mensagens_projeto(autor_id);

ALTER TABLE mensagens_projeto ENABLE ROW LEVEL SECURITY;

CREATE POLICY msg_select ON mensagens_projeto FOR SELECT TO authenticated USING (true);
CREATE POLICY msg_insert ON mensagens_projeto FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Tabela de destinatários de mensagem (setores)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagem_destinatarios (
  id SERIAL PRIMARY KEY,
  mensagem_id INTEGER NOT NULL REFERENCES mensagens_projeto(id) ON DELETE CASCADE,
  setor_id INTEGER NOT NULL REFERENCES setores(id),
  UNIQUE(mensagem_id, setor_id)
);

CREATE INDEX IF NOT EXISTS idx_msg_dest_mensagem ON mensagem_destinatarios(mensagem_id);
CREATE INDEX IF NOT EXISTS idx_msg_dest_setor ON mensagem_destinatarios(setor_id);

ALTER TABLE mensagem_destinatarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY msg_dest_select ON mensagem_destinatarios FOR SELECT TO authenticated USING (true);
CREATE POLICY msg_dest_insert ON mensagem_destinatarios FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Tabela de leituras de mensagem (por usuário)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagem_leituras (
  id SERIAL PRIMARY KEY,
  mensagem_id INTEGER NOT NULL REFERENCES mensagens_projeto(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mensagem_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_msg_leitura_mensagem ON mensagem_leituras(mensagem_id);
CREATE INDEX IF NOT EXISTS idx_msg_leitura_usuario ON mensagem_leituras(usuario_id);

ALTER TABLE mensagem_leituras ENABLE ROW LEVEL SECURITY;

CREATE POLICY msg_leitura_select ON mensagem_leituras FOR SELECT TO authenticated USING (true);
CREATE POLICY msg_leitura_insert ON mensagem_leituras FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY msg_leitura_update ON mensagem_leituras FOR UPDATE TO authenticated USING (true);

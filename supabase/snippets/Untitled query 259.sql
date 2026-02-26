-- ============================================================
-- MIGRAÇÃO: Status nas atividades
-- ============================================================

SET client_encoding = 'UTF8';

-- 1. Coluna de status na atividade
ALTER TABLE atividades ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aberta'
    CHECK (status IN ('aberta', 'em_andamento', 'aguardando', 'resolvida', 'cancelada'));

ALTER TABLE atividades ADD COLUMN IF NOT EXISTS motivo_status TEXT;

-- 2. Índice para filtros por status
CREATE INDEX IF NOT EXISTS idx_ativ_status ON atividades(status);

-- Verificação
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'atividades' AND column_name IN ('status', 'motivo_status', 'data_prevista');
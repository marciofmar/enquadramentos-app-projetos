-- ============================================================
-- MIGRAÇÃO: Data nas atividades + constraints de unicidade
-- ============================================================

SET client_encoding = 'UTF8';

-- 1. Coluna de data na atividade (opcional)
ALTER TABLE atividades ADD COLUMN IF NOT EXISTS data_prevista DATE;

-- 2. Índice para consultas por data
CREATE INDEX IF NOT EXISTS idx_ativ_data ON atividades(data_prevista);

-- 3. Constraints de unicidade: um setor por entrega, um setor por atividade
-- Para participantes tipo 'setor', setor_id + entrega_id deve ser único
-- Para tipos externos, tipo_participante + entrega_id deve ser único
CREATE UNIQUE INDEX IF NOT EXISTS idx_ep_setor_unique
    ON entrega_participantes(entrega_id, setor_id)
    WHERE tipo_participante = 'setor' AND setor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ep_externo_unique
    ON entrega_participantes(entrega_id, tipo_participante)
    WHERE tipo_participante != 'setor';

CREATE UNIQUE INDEX IF NOT EXISTS idx_ap_setor_unique
    ON atividade_participantes(atividade_id, setor_id)
    WHERE tipo_participante = 'setor' AND setor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ap_externo_unique
    ON atividade_participantes(atividade_id, tipo_participante)
    WHERE tipo_participante != 'setor';

-- Verificação
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'atividades' AND column_name = 'data_prevista';
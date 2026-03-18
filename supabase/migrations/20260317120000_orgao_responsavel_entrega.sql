-- Adicionar campos de órgão responsável e responsável por entrega
ALTER TABLE entregas
  ADD COLUMN IF NOT EXISTS orgao_responsavel_setor_id integer REFERENCES setores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responsavel_entrega text;

ALTER TABLE riscos
  ADD COLUMN IF NOT EXISTS impacto TEXT CHECK (impacto IN ('baixo','medio','alto'));

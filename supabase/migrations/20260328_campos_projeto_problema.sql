-- Adiciona campos de diagnóstico do problema ao formulário de projetos
-- Campos: causas, consequencias_diretas, objetivos

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projetos' AND column_name = 'causas'
  ) THEN
    ALTER TABLE projetos ADD COLUMN causas TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projetos' AND column_name = 'consequencias_diretas'
  ) THEN
    ALTER TABLE projetos ADD COLUMN consequencias_diretas TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projetos' AND column_name = 'objetivos'
  ) THEN
    ALTER TABLE projetos ADD COLUMN objetivos TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

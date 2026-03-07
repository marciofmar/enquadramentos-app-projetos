-- Fase 1: Novos campos no formulário de projetos e entregas

-- Campos novos em projetos
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS responsavel text;
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS indicador_sucesso text;
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS tipo_acao text[];

-- Campo novo em entregas
ALTER TABLE entregas ADD COLUMN IF NOT EXISTS criterios_aceite text;

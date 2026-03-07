-- Fase 2: Separar permissões de projetos/entregas vs atividades

-- Novas chaves de configuração
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('proj_permitir_cadastro_atividades', 'true', 'Permite gestores cadastrarem atividades'),
  ('proj_permitir_edicao_atividades', 'true', 'Permite gestores editarem/excluírem atividades'),
  ('proj_permitir_edicao_datas_atividades', 'true', 'Permite gestores editarem datas das atividades')
ON CONFLICT (chave) DO NOTHING;

-- Renomear descrições das chaves existentes para clareza
UPDATE configuracoes SET descricao = 'Permite gestores cadastrarem projetos e entregas' WHERE chave = 'proj_permitir_cadastro';
UPDATE configuracoes SET descricao = 'Permite gestores editarem/excluírem projetos e entregas' WHERE chave = 'proj_permitir_edicao';
UPDATE configuracoes SET descricao = 'Permite gestores editarem quinzenas das entregas' WHERE chave = 'proj_permitir_edicao_datas';

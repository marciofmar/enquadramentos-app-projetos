-- Migração: Gestão de usuários - senha zerada, reset token, config de email
-- Adiciona campos para fluxo de reset de senha pelo admin e toggle de email

-- Novos campos na tabela profiles
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "senha_zerada" boolean DEFAULT false;
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "reset_token" text;

-- Nova configuração: funções de email
INSERT INTO "public"."configuracoes" ("chave", "valor", "descricao")
VALUES ('email_funcoes_ativas', 'false', 'Ativa confirmação de email no cadastro e recuperação de senha por email')
ON CONFLICT ("chave") DO NOTHING;
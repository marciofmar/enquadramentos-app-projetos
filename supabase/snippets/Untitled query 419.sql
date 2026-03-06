-- ============================================================
-- 14_limpeza_setores.sql
-- Limpeza de setores redundantes + coluna visivel_cadastro
-- EXECUTAR EM: dev → homolog → produção (nesta ordem)
-- ============================================================

BEGIN;

-- ============================================================
-- ETAPA 1: Adicionar coluna visivel_cadastro
-- ============================================================

ALTER TABLE public.setores
  ADD COLUMN IF NOT EXISTS visivel_cadastro boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.setores.visivel_cadastro IS
  'false = setor-agrupamento, não aparece no cadastro de usuários nem na atribuição de setor pelo admin';

-- ============================================================
-- ETAPA 2: Transferir vinculações N:N das duplicatas
-- ============================================================

-- Par 1: COORD._ENGENHARIA (7) → COORD_ENGENHARIA (8)
-- 3 panoramico_setores, sem conflito
UPDATE public.panoramico_setores SET setor_id = 8 WHERE setor_id = 7;

-- Par 2: GABINETE_DE_GESTÃO_DE_PROJETOS (14) → GAB_GESTAO_PROJETOS (15)
-- 1 panoramico_setores, sem conflito
UPDATE public.panoramico_setores SET setor_id = 15 WHERE setor_id = 14;

-- Par 3: ÓRGÃOS_SUBORDINADOS (25) → ÓRGÃOS SUBORDINADOS (19)
-- 17 panoramico_setores, sem conflito
UPDATE public.panoramico_setores SET setor_id = 19 WHERE setor_id = 25;

-- DAEAD (9) → ICTDEC (17)
-- panoramico_setores: pan_linha 13 já tem ICTDEC → deletar em vez de transferir
DELETE FROM public.panoramico_setores WHERE setor_id = 9;
-- ficha_setores: ficha 13 já tem ICTDEC → deletar em vez de transferir
DELETE FROM public.ficha_setores WHERE setor_id = 9;

-- ============================================================
-- ETAPA 3: Deletar setores redundantes
-- (neste ponto não devem ter mais nenhuma FK apontando para eles)
-- ============================================================

DELETE FROM public.setores WHERE id = 7;   -- COORD._ENGENHARIA (duplicata)
DELETE FROM public.setores WHERE id = 14;  -- GABINETE_DE_GESTÃO_DE_PROJETOS (duplicata)
DELETE FROM public.setores WHERE id = 25;  -- ÓRGÃOS_SUBORDINADOS (duplicata)
DELETE FROM public.setores WHERE id = 9;   -- DAEAD (divisão interna do ICTDEC)

-- ============================================================
-- ETAPA 4: Marcar agrupamentos como não visíveis no cadastro
-- ============================================================

UPDATE public.setores SET visivel_cadastro = false WHERE id = 18;  -- ORGAOS_FINALISTICOS
UPDATE public.setores SET visivel_cadastro = false WHERE id = 19;  -- ÓRGÃOS SUBORDINADOS
UPDATE public.setores SET visivel_cadastro = false WHERE id = 21;  -- SECRETARIO
UPDATE public.setores SET visivel_cadastro = false WHERE id = 6;   -- CONEPDEC

-- REDECS (20) permanece visível (Opção A)

-- ============================================================
-- VERIFICAÇÃO (rode após o COMMIT para conferir)
-- ============================================================

-- SELECT id, codigo, nome_completo, visivel_cadastro FROM public.setores ORDER BY codigo;
-- Esperado: 25 setores (29 originais - 4 removidos), 4 com visivel_cadastro=false

COMMIT;

-- ============================================================
-- Migracao: Integridade de Dados
-- Corrige FKs que bloqueiam exclusao de usuario (P1.1)
-- Corrige admin_delete_setor para conflitos unique (P1.2)
-- Corrige admin_delete_setor para tipo 'usuario' (P1.3)
-- Adiciona colunas snapshot de nome (P3.1)
-- ============================================================

-- ============================================================
-- 0. EXPANDIR CONSTRAINTS DE alertas PARA NOVOS TIPOS
-- ============================================================

-- Adicionar novos tipos de alerta (alteracao de setor)
ALTER TABLE alertas DROP CONSTRAINT IF EXISTS alertas_tipo_check;
ALTER TABLE alertas ADD CONSTRAINT alertas_tipo_check
  CHECK (tipo IN ('edicao_entrega','exclusao_entrega','edicao_atividade','exclusao_atividade','alteracao_setor_entrega','alteracao_setor_lider'));

ALTER TABLE alertas DROP CONSTRAINT IF EXISTS alertas_entidade_check;
ALTER TABLE alertas ADD CONSTRAINT alertas_entidade_check
  CHECK (entidade IN ('entrega','atividade','projeto'));

-- ============================================================
-- 1. CORRIGIR FKs QUE BLOQUEIAM EXCLUSAO DE USUARIO
-- ============================================================

-- audit_log.usuario_id: preserva log, apaga vinculo
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_usuario_id_fkey;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- observacoes.autor_id: preserva observacao
ALTER TABLE observacoes DROP CONSTRAINT IF EXISTS observacoes_autor_id_fkey;
ALTER TABLE observacoes ADD CONSTRAINT observacoes_autor_id_fkey
  FOREIGN KEY (autor_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- observacoes.respondido_por
ALTER TABLE observacoes DROP CONSTRAINT IF EXISTS observacoes_respondido_por_fkey;
ALTER TABLE observacoes ADD CONSTRAINT observacoes_respondido_por_fkey
  FOREIGN KEY (respondido_por) REFERENCES profiles(id) ON DELETE SET NULL;

-- configuracoes.atualizado_por
ALTER TABLE configuracoes DROP CONSTRAINT IF EXISTS configuracoes_atualizado_por_fkey;
ALTER TABLE configuracoes ADD CONSTRAINT configuracoes_atualizado_por_fkey
  FOREIGN KEY (atualizado_por) REFERENCES profiles(id) ON DELETE SET NULL;

-- solicitacoes_alteracao.solicitante_id
ALTER TABLE solicitacoes_alteracao DROP CONSTRAINT IF EXISTS solicitacoes_alteracao_solicitante_id_fkey;
ALTER TABLE solicitacoes_alteracao ADD CONSTRAINT solicitacoes_alteracao_solicitante_id_fkey
  FOREIGN KEY (solicitante_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- solicitacoes_alteracao.avaliador_id
ALTER TABLE solicitacoes_alteracao DROP CONSTRAINT IF EXISTS solicitacoes_alteracao_avaliador_id_fkey;
ALTER TABLE solicitacoes_alteracao ADD CONSTRAINT solicitacoes_alteracao_avaliador_id_fkey
  FOREIGN KEY (avaliador_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- projetos.criado_por
ALTER TABLE projetos DROP CONSTRAINT IF EXISTS projetos_criado_por_fkey;
ALTER TABLE projetos ADD CONSTRAINT projetos_criado_por_fkey
  FOREIGN KEY (criado_por) REFERENCES profiles(id) ON DELETE SET NULL;

-- atividade_participantes.user_id: remove participacao ao excluir usuario
ALTER TABLE atividade_participantes DROP CONSTRAINT IF EXISTS atividade_participantes_user_id_fkey;
ALTER TABLE atividade_participantes ADD CONSTRAINT atividade_participantes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================================
-- 2. COLUNAS SNAPSHOT DE NOME
-- ============================================================

-- audit_log: preservar nome do usuario apos exclusao
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS usuario_nome TEXT;

-- observacoes: preservar nome do autor apos exclusao
ALTER TABLE observacoes ADD COLUMN IF NOT EXISTS autor_nome TEXT;

-- Preencher snapshots existentes
UPDATE audit_log SET usuario_nome = p.nome
FROM profiles p WHERE audit_log.usuario_id = p.id AND audit_log.usuario_nome IS NULL;

UPDATE observacoes SET autor_nome = p.nome
FROM profiles p WHERE observacoes.autor_id = p.id AND observacoes.autor_nome IS NULL;

-- ============================================================
-- 3. CORRIGIR admin_delete_setor (P1.2 + P1.3)
-- Trata conflitos de unique e tipo 'usuario'
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_delete_setor(p_setor_id integer, p_transfer_to_id integer DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_deps json;
    v_total int;
    v_merged int := 0;
    v_tmp int;
BEGIN
    -- Contar dependencias (incluindo tipo 'usuario' em atividade_participantes)
    SELECT json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes_setor', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor'),
        'atividade_participantes_usuario', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'usuario'),
        'panoramico_setores', (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id),
        'ficha_setores', (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id),
        'total', (
            (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id) +
            (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id)
        )
    ) INTO v_deps;

    v_total := (v_deps->>'total')::int;

    IF p_transfer_to_id IS NOT NULL AND v_total > 0 THEN
        -- profiles e projetos: transferencia direta (sem unique constraints)
        UPDATE profiles SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE projetos SET setor_lider_id = p_transfer_to_id WHERE setor_lider_id = p_setor_id;

        -- entrega_participantes: tratar conflito de unique (entrega_id, setor_id)
        -- Primeiro remover duplicatas (onde o setor destino ja existe na mesma entrega)
        DELETE FROM entrega_participantes ep
        WHERE ep.setor_id = p_setor_id
          AND EXISTS (
            SELECT 1 FROM entrega_participantes ep2
            WHERE ep2.entrega_id = ep.entrega_id
              AND ep2.setor_id = p_transfer_to_id
              AND ep2.tipo_participante = ep.tipo_participante
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        -- Depois transferir os restantes
        UPDATE entrega_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;

        -- atividade_participantes tipo 'setor': tratar conflito de unique
        DELETE FROM atividade_participantes ap
        WHERE ap.setor_id = p_setor_id AND ap.tipo_participante = 'setor'
          AND EXISTS (
            SELECT 1 FROM atividade_participantes ap2
            WHERE ap2.atividade_id = ap.atividade_id
              AND ap2.setor_id = p_transfer_to_id
              AND ap2.tipo_participante = 'setor'
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id
          WHERE setor_id = p_setor_id AND tipo_participante = 'setor';

        -- atividade_participantes tipo 'usuario': transferir snapshot de setor
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id
          WHERE setor_id = p_setor_id AND tipo_participante = 'usuario';

        -- panoramico_setores: tratar duplicatas
        DELETE FROM panoramico_setores ps
        WHERE ps.setor_id = p_setor_id
          AND EXISTS (
            SELECT 1 FROM panoramico_setores ps2
            WHERE ps2.panoramico_linha_id = ps.panoramico_linha_id
              AND ps2.setor_id = p_transfer_to_id
              AND ps2.tipo_participacao = ps.tipo_participacao
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        UPDATE panoramico_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;

        -- ficha_setores: tratar duplicatas
        DELETE FROM ficha_setores fs
        WHERE fs.setor_id = p_setor_id
          AND EXISTS (
            SELECT 1 FROM ficha_setores fs2
            WHERE fs2.ficha_id = fs.ficha_id
              AND fs2.setor_id = p_transfer_to_id
              AND fs2.tipo_participacao = fs.tipo_participacao
          );
        GET DIAGNOSTICS v_tmp = ROW_COUNT;
        v_merged := v_merged + v_tmp;
        UPDATE ficha_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
    END IF;

    IF v_total = 0 OR p_transfer_to_id IS NOT NULL THEN
        DELETE FROM setores WHERE id = p_setor_id;
        RETURN json_build_object('deleted', true, 'dependencies', v_deps, 'merged', v_merged);
    ELSE
        RETURN json_build_object('deleted', false, 'dependencies', v_deps, 'merged', 0);
    END IF;
END;
$$;

-- ============================================================
-- 4. ATUALIZAR check_setor_dependencies (incluir tipo 'usuario')
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_setor_dependencies(p_setor_id integer)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes_setor', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor'),
        'atividade_participantes_usuario', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'usuario'),
        'panoramico_setores', (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id),
        'ficha_setores', (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id),
        'total', (
            (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id) +
            (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id)
        )
    );
END;
$$;

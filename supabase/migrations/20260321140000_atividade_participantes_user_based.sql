-- Migração: Participantes de atividade baseados em usuário
-- Adiciona user_id à tabela atividade_participantes para vincular participação a usuários individuais
-- O setor_id passa a ser um snapshot do setor do usuário no momento da atribuição

-- 1. Adicionar coluna user_id
ALTER TABLE atividade_participantes ADD COLUMN user_id UUID REFERENCES profiles(id);

-- 2. Atualizar constraint de tipo_participante para incluir 'usuario'
ALTER TABLE atividade_participantes DROP CONSTRAINT atividade_participantes_tipo_participante_check;
ALTER TABLE atividade_participantes ADD CONSTRAINT atividade_participantes_tipo_participante_check
  CHECK (tipo_participante = ANY (ARRAY['setor','usuario','externo_subsegop','externo_sedec']));

-- 3. Índice para busca por user_id
CREATE INDEX idx_ap_user ON atividade_participantes (user_id) WHERE user_id IS NOT NULL;

-- 4. Unicidade: mesmo usuário não pode participar 2x da mesma atividade
CREATE UNIQUE INDEX idx_ap_user_atividade_unique ON atividade_participantes (atividade_id, user_id)
  WHERE user_id IS NOT NULL;

-- 5. Corrigir índice único de externos: antes excluía 'setor', agora deve ser restrito
-- apenas aos tipos externos, pois 'usuario' pode ter múltiplos registros por atividade
DROP INDEX IF EXISTS idx_ap_externo_unique;
CREATE UNIQUE INDEX idx_ap_externo_unique ON atividade_participantes (atividade_id, tipo_participante)
  WHERE tipo_participante IN ('externo_subsegop', 'externo_sedec');

-- 6. Atualizar admin_delete_setor: só transferir registros tipo 'setor' (legado)
-- Registros tipo 'usuario' mantêm o setor_id snapshot original
CREATE OR REPLACE FUNCTION public.admin_delete_setor(p_setor_id integer, p_transfer_to_id integer DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_deps json;
    v_total int;
BEGIN
    -- Verificar dependências
    SELECT json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor'),
        'panoramico_setores', (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id),
        'ficha_setores', (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id),
        'total', (
            (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id) +
            (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor') +
            (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id)
        )
    ) INTO v_deps;

    v_total := (v_deps->>'total')::int;

    IF p_transfer_to_id IS NOT NULL AND v_total > 0 THEN
        -- Transferir dependências para o setor destino
        UPDATE profiles SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE projetos SET setor_lider_id = p_transfer_to_id WHERE setor_lider_id = p_setor_id;
        UPDATE entrega_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        -- Só transferir registros legados (tipo 'setor'); registros de usuário mantêm snapshot
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id
          WHERE setor_id = p_setor_id AND tipo_participante = 'setor';
        UPDATE panoramico_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE ficha_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
    END IF;

    IF v_total = 0 OR p_transfer_to_id IS NOT NULL THEN
        DELETE FROM setores WHERE id = p_setor_id;
        RETURN json_build_object('deleted', true, 'dependencies', v_deps);
    ELSE
        RETURN json_build_object('deleted', false, 'dependencies', v_deps);
    END IF;
END;
$$;

-- 7. Atualizar check_setor_dependencies para contar corretamente
CREATE OR REPLACE FUNCTION public.check_setor_dependencies(p_setor_id integer)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor'),
        'panoramico_setores', (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id),
        'ficha_setores', (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id),
        'total', (
            (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id) +
            (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id AND tipo_participante = 'setor') +
            (SELECT COUNT(*) FROM panoramico_setores WHERE setor_id = p_setor_id) +
            (SELECT COUNT(*) FROM ficha_setores WHERE setor_id = p_setor_id)
        )
    );
END;
$$;

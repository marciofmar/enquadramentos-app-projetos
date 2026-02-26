-- ============================================================
-- MÓDULO: GESTÃO DE SETORES (ADMIN)
-- Permite criar, editar e excluir setores com proteção contra
-- registros órfãos e preservação do histórico.
-- ============================================================

-- 1. RLS: Admin pode fazer CRUD em setores
-- (Leitura já existe para authenticated e anon)

CREATE POLICY "admin_insert_setores" ON setores
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "admin_update_setores" ON setores
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "admin_delete_setores" ON setores
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. FUNÇÃO: Verifica dependências de um setor antes de permitir exclusão
-- Retorna um JSON com contagem de dependências por tabela

CREATE OR REPLACE FUNCTION check_setor_dependencies(p_setor_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'profiles', (SELECT COUNT(*) FROM profiles WHERE setor_id = p_setor_id),
        'projetos', (SELECT COUNT(*) FROM projetos WHERE setor_lider_id = p_setor_id),
        'entrega_participantes', (SELECT COUNT(*) FROM entrega_participantes WHERE setor_id = p_setor_id),
        'atividade_participantes', (SELECT COUNT(*) FROM atividade_participantes WHERE setor_id = p_setor_id),
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
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO: Exclusão segura — só permite se não há dependências,
--    ou transfere dependências para outro setor se informado

CREATE OR REPLACE FUNCTION admin_delete_setor(
    p_setor_id INTEGER,
    p_transfer_to_id INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    caller_role TEXT;
    deps JSON;
    dep_total INTEGER;
BEGIN
    -- Verifica permissão
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Permissão negada: apenas admin';
    END IF;

    -- Verifica dependências
    deps := check_setor_dependencies(p_setor_id);
    dep_total := (deps->>'total')::INTEGER;

    -- Se há dependências e não informou setor de destino, bloqueia
    IF dep_total > 0 AND p_transfer_to_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'reason', 'has_dependencies',
            'dependencies', deps
        );
    END IF;

    -- Se há dependências e informou destino, transfere
    IF dep_total > 0 AND p_transfer_to_id IS NOT NULL THEN
        -- Valida que o setor destino existe e é diferente
        IF NOT EXISTS (SELECT 1 FROM setores WHERE id = p_transfer_to_id) THEN
            RAISE EXCEPTION 'Setor de destino não existe';
        END IF;
        IF p_transfer_to_id = p_setor_id THEN
            RAISE EXCEPTION 'Setor de destino deve ser diferente do setor sendo excluído';
        END IF;

        -- Transfere dependências
        UPDATE profiles SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE projetos SET setor_lider_id = p_transfer_to_id WHERE setor_lider_id = p_setor_id;
        UPDATE entrega_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE atividade_participantes SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE panoramico_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
        UPDATE ficha_setores SET setor_id = p_transfer_to_id WHERE setor_id = p_setor_id;
    END IF;

    -- Exclui o setor
    DELETE FROM setores WHERE id = p_setor_id;

    RETURN json_build_object('success', true, 'transferred_to', p_transfer_to_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

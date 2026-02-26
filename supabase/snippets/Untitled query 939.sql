-- ============================================================
-- MÓDULO DE GESTÃO DE PROJETOS — MIGRAÇÃO DE BANCO
-- SEDEC-RJ / ICTDEC / DAEAD
-- Rode este script APÓS o banco existente estar no ar.
-- Ele dropa as tabelas antigas (projetos, entregas, atividades)
-- e recria com a nova modelagem.
-- ============================================================

SET client_encoding = 'UTF8';

-- ============================================================
-- 1. REMOVER TABELAS ANTIGAS (sem dados de produção)
-- ============================================================

DROP TABLE IF EXISTS atividades CASCADE;
DROP TABLE IF EXISTS entregas CASCADE;
DROP TABLE IF EXISTS projetos CASCADE;

-- Remover policies antigas dessas tabelas (se existirem)
-- (CASCADE acima já cuida)

-- ============================================================
-- 2. NOVAS TABELAS
-- ============================================================

-- PROJETOS (reestruturada)
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    problema_resolve TEXT NOT NULL,
    setor_lider_id INTEGER NOT NULL REFERENCES setores(id),
    criado_por UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJETO ↔ AÇÕES ESTRATÉGICAS (N:N)
CREATE TABLE projeto_acoes (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    acao_estrategica_id INTEGER NOT NULL REFERENCES acoes_estrategicas(id) ON DELETE CASCADE,
    UNIQUE(projeto_id, acao_estrategica_id)
);

-- ENTREGAS
CREATE TABLE entregas (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    dependencias_criticas TEXT,
    data_final_prevista DATE,
    status TEXT NOT NULL DEFAULT 'aberta'
        CHECK (status IN ('aberta', 'em_andamento', 'aguardando', 'resolvida', 'cancelada')),
    motivo_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTICIPANTES DE ENTREGA (N:N com setor + papel)
-- setor_id NULL quando tipo_participante = 'externo_subsegop' ou 'externo_sedec'
CREATE TABLE entrega_participantes (
    id SERIAL PRIMARY KEY,
    entrega_id INTEGER NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
    setor_id INTEGER REFERENCES setores(id),
    tipo_participante TEXT NOT NULL DEFAULT 'setor'
        CHECK (tipo_participante IN ('setor', 'externo_subsegop', 'externo_sedec')),
    papel TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATIVIDADES (vinculadas obrigatoriamente a uma entrega)
CREATE TABLE atividades (
    id SERIAL PRIMARY KEY,
    entrega_id INTEGER NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTICIPANTES DE ATIVIDADE (N:N com setor + papel)
CREATE TABLE atividade_participantes (
    id SERIAL PRIMARY KEY,
    atividade_id INTEGER NOT NULL REFERENCES atividades(id) ON DELETE CASCADE,
    setor_id INTEGER REFERENCES setores(id),
    tipo_participante TEXT NOT NULL DEFAULT 'setor'
        CHECK (tipo_participante IN ('setor', 'externo_subsegop', 'externo_sedec')),
    papel TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES profiles(id),
    usuario_nome TEXT,
    tipo_acao TEXT NOT NULL CHECK (tipo_acao IN ('create', 'update', 'delete')),
    entidade TEXT NOT NULL CHECK (entidade IN ('projeto', 'entrega', 'atividade', 'entrega_participante', 'atividade_participante')),
    entidade_id INTEGER NOT NULL,
    conteudo_anterior JSONB,
    conteudo_novo JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ============================================================

-- Projetos
CREATE INDEX idx_proj_setor_lider ON projetos(setor_lider_id);
CREATE INDEX idx_proj_criado_por ON projetos(criado_por);

-- Projeto ↔ Ações
CREATE INDEX idx_proj_acoes_projeto ON projeto_acoes(projeto_id);
CREATE INDEX idx_proj_acoes_acao ON projeto_acoes(acao_estrategica_id);

-- Entregas
CREATE INDEX idx_entregas_projeto ON entregas(projeto_id);
CREATE INDEX idx_entregas_data ON entregas(data_final_prevista);
CREATE INDEX idx_entregas_status ON entregas(status);

-- Participantes entrega
CREATE INDEX idx_ep_entrega ON entrega_participantes(entrega_id);
CREATE INDEX idx_ep_setor ON entrega_participantes(setor_id);

-- Atividades
CREATE INDEX idx_ativ_entrega ON atividades(entrega_id);

-- Participantes atividade
CREATE INDEX idx_ap_atividade ON atividade_participantes(atividade_id);
CREATE INDEX idx_ap_setor ON atividade_participantes(setor_id);

-- Audit log
CREATE INDEX idx_audit_entidade ON audit_log(entidade, entidade_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ============================================================
-- 4. TRIGGERS updated_at
-- ============================================================

CREATE TRIGGER tr_projetos_updated BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_entregas_updated BEFORE UPDATE ON entregas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_atividades_updated BEFORE UPDATE ON atividades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. RLS (Row Level Security)
-- ============================================================

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrega_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividade_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- === LEITURA: todos autenticados leem tudo ===
CREATE POLICY "proj_select" ON projetos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pa_select" ON projeto_acoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "ent_select" ON entregas FOR SELECT TO authenticated USING (true);
CREATE POLICY "ep_select" ON entrega_participantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "ativ_select" ON atividades FOR SELECT TO authenticated USING (true);
CREATE POLICY "ap_select" ON atividade_participantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_select_admin" ON audit_log FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- === ESCRITA: admin faz tudo ===
CREATE POLICY "proj_admin" ON projetos FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "pa_admin" ON projeto_acoes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ent_admin" ON entregas FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ep_admin" ON entrega_participantes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ativ_admin" ON atividades FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ap_admin" ON atividade_participantes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "audit_admin" ON audit_log FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- === ESCRITA: gestor cria/edita projetos do seu setor ===
CREATE POLICY "proj_gestor_insert" ON projetos FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gestor'
            AND setor_id = projetos.setor_lider_id)
    );

CREATE POLICY "proj_gestor_update" ON projetos FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gestor'
            AND setor_id = projetos.setor_lider_id)
    );

CREATE POLICY "proj_gestor_delete" ON projetos FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gestor'
            AND setor_id = projetos.setor_lider_id)
    );

-- Gestor: escrita em sub-tabelas se é gestor do projeto pai
CREATE POLICY "pa_gestor" ON projeto_acoes FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM projetos p JOIN profiles pr ON pr.id = auth.uid()
        WHERE p.id = projeto_acoes.projeto_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM projetos p JOIN profiles pr ON pr.id = auth.uid()
        WHERE p.id = projeto_acoes.projeto_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ));

CREATE POLICY "ent_gestor" ON entregas FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM projetos p JOIN profiles pr ON pr.id = auth.uid()
        WHERE p.id = entregas.projeto_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM projetos p JOIN profiles pr ON pr.id = auth.uid()
        WHERE p.id = entregas.projeto_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ));

CREATE POLICY "ep_gestor" ON entrega_participantes FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM entregas e JOIN projetos p ON p.id = e.projeto_id
        JOIN profiles pr ON pr.id = auth.uid()
        WHERE e.id = entrega_participantes.entrega_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM entregas e JOIN projetos p ON p.id = e.projeto_id
        JOIN profiles pr ON pr.id = auth.uid()
        WHERE e.id = entrega_participantes.entrega_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ));

CREATE POLICY "ativ_gestor" ON atividades FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM entregas e JOIN projetos p ON p.id = e.projeto_id
        JOIN profiles pr ON pr.id = auth.uid()
        WHERE e.id = atividades.entrega_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM entregas e JOIN projetos p ON p.id = e.projeto_id
        JOIN profiles pr ON pr.id = auth.uid()
        WHERE e.id = atividades.entrega_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ));

CREATE POLICY "ap_gestor" ON atividade_participantes FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM atividades a JOIN entregas e ON e.id = a.entrega_id
        JOIN projetos p ON p.id = e.projeto_id JOIN profiles pr ON pr.id = auth.uid()
        WHERE a.id = atividade_participantes.atividade_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM atividades a JOIN entregas e ON e.id = a.entrega_id
        JOIN projetos p ON p.id = e.projeto_id JOIN profiles pr ON pr.id = auth.uid()
        WHERE a.id = atividade_participantes.atividade_id AND pr.role = 'gestor' AND pr.setor_id = p.setor_lider_id
    ));

-- Gestor pode inserir log
CREATE POLICY "audit_gestor_insert" ON audit_log FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

-- ============================================================
-- 6. CONFIGURAÇÕES DO MÓDULO
-- ============================================================

INSERT INTO configuracoes (chave, valor, descricao) VALUES
    ('proj_permitir_cadastro', 'true', 'Permite que gestores criem projetos/entregas/atividades'),
    ('proj_permitir_edicao', 'true', 'Permite que gestores editem/excluam projetos/entregas/atividades'),
    ('proj_permitir_edicao_datas', 'true', 'Permite que gestores alterem datas das entregas')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- ============================================================
-- 7. VIEW ÚTIL: status de pontualidade dos projetos
-- ============================================================

CREATE OR REPLACE VIEW v_projeto_status AS
SELECT
    p.id,
    p.nome,
    p.setor_lider_id,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM entregas e
            WHERE e.projeto_id = p.id
            AND e.status NOT IN ('resolvida', 'cancelada')
            AND e.data_final_prevista < CURRENT_DATE
        ) THEN 'atrasado'
        WHEN EXISTS (
            SELECT 1 FROM entregas e
            WHERE e.projeto_id = p.id
            AND e.status NOT IN ('resolvida', 'cancelada')
            AND e.data_final_prevista >= CURRENT_DATE
            AND e.data_final_prevista <= CURRENT_DATE + INTERVAL '15 days'
        ) THEN 'proximo'
        ELSE 'em_dia'
    END AS pontualidade,
    (
        SELECT MIN(e.data_final_prevista)
        FROM entregas e
        WHERE e.projeto_id = p.id
        AND e.status NOT IN ('resolvida', 'cancelada')
        AND e.data_final_prevista >= CURRENT_DATE
    ) AS proxima_entrega
FROM projetos p;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename IN ('projetos', 'projeto_acoes', 'entregas', 'entrega_participantes', 'atividades', 'atividade_participantes', 'audit_log')
ORDER BY tablename;
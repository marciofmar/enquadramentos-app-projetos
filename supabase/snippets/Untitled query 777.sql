-- ============================================================
-- Migração: Push Subscriptions para Web Push Notifications
-- Data: 2026-04-03
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_sub_user ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver e remover suas próprias inscrições
CREATE POLICY push_sub_select ON push_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY push_sub_insert ON push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY push_sub_update ON push_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY push_sub_delete ON push_subscriptions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Service role (server-side) precisa ler todas as inscrições para enviar pushes
-- O service role key já bypassa RLS por padrão no Supabase

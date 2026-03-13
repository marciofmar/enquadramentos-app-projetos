import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client Supabase com service role — usado para queries ao banco (PostgREST)
// e chamadas .rpc() para funções SECURITY DEFINER.
// PostgREST aceita a HS256 SERVICE_ROLE_KEY sem problemas.
export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

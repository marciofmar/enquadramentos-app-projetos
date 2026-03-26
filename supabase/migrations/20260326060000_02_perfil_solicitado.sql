-- ============================================================
-- Migração: Adicionar perfil_solicitado ao profiles
-- ============================================================

-- Adicionar coluna
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfil_solicitado TEXT;

-- Atualizar trigger handle_new_user para copiar perfil_solicitado
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, setor_id, role, perfil_solicitado)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    (NEW.raw_user_meta_data->>'setor_id')::INTEGER,
    'solicitante',
    NEW.raw_user_meta_data->>'perfil_solicitado'
  );
  RETURN NEW;
END;
$$;

-- Criar trigger (caso não exista) para invocar a função ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

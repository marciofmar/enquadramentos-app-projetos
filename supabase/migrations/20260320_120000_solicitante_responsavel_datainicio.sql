-- R1: Adicionar 'solicitante' ao CHECK de role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'master', 'gestor', 'usuario', 'solicitante'));

-- R1: Novos cadastros entram como 'solicitante'
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, setor_id, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    (NEW.raw_user_meta_data->>'setor_id')::INTEGER,
    'solicitante'
  );
  RETURN NEW;
END;
$$;

-- R5: Data início do projeto
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS data_inicio date;

-- R3: Converter responsavel de texto para FK uuid (perda de dados aceita)
-- Projetos
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS responsavel_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE projetos DROP COLUMN IF EXISTS responsavel;

-- Entregas
ALTER TABLE entregas ADD COLUMN IF NOT EXISTS responsavel_entrega_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE entregas DROP COLUMN IF EXISTS responsavel_entrega;

-- R2 + R3: Responsável de atividade (já como FK)
ALTER TABLE atividades ADD COLUMN IF NOT EXISTS responsavel_atividade_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Recarregar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

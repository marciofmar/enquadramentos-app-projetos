-- Fase 3: Perfil Master

-- Alterar constraint de role para incluir 'master'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'master', 'gestor', 'usuario'));

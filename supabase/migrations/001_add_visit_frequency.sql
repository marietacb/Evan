-- Añadir frecuencia de visitas al psicólogo en el perfil del paciente
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS visit_frequency text;

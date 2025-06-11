/*
  # Sistema de EPS y Centros Médicos Afiliados

  1. Nuevas Tablas
    - `eps` - Entidades Promotoras de Salud
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `logo_url` (text)
      - `created_at` (timestamp)
    
    - `medical_facilities` - Centros médicos (hospitales, clínicas, IPS, etc.)
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - Hospital, IPS, Clínica, Centro de Salud
      - `address` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `phone` (text, nullable)
      - `schedule` (text, nullable)
      - `services` (text[], nullable)
      - `photo_url` (text, nullable)
      - `rating` (numeric, nullable)
      - `created_at` (timestamp)
    
    - `eps_facility_partnerships` - Relación entre EPS y centros médicos
      - `eps_id` (uuid, foreign key)
      - `facility_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - Restricción de unicidad en (eps_id, facility_id)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas de lectura pública para todas las tablas
    - Políticas de escritura solo para usuarios autenticados (administradores)

  3. Índices
    - Índice geoespacial para búsquedas por ubicación
    - Índices para optimizar consultas de relaciones
*/

-- Crear tabla de EPS
CREATE TABLE IF NOT EXISTS eps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de centros médicos
CREATE TABLE IF NOT EXISTS medical_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Hospital', 'IPS', 'Clínica', 'Centro de Salud', 'EPS')),
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  phone text,
  schedule text,
  services text[],
  photo_url text,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de relaciones EPS-Centros médicos
CREATE TABLE IF NOT EXISTS eps_facility_partnerships (
  eps_id uuid REFERENCES eps(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES medical_facilities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (eps_id, facility_id)
);

-- Habilitar RLS
ALTER TABLE eps ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE eps_facility_partnerships ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad - Lectura pública
CREATE POLICY "Public read access for eps"
  ON eps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for medical_facilities"
  ON medical_facilities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for eps_facility_partnerships"
  ON eps_facility_partnerships
  FOR SELECT
  TO public
  USING (true);

-- Políticas de escritura para usuarios autenticados
CREATE POLICY "Authenticated users can insert eps"
  ON eps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update eps"
  ON eps
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert medical_facilities"
  ON medical_facilities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update medical_facilities"
  ON medical_facilities
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert partnerships"
  ON eps_facility_partnerships
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_medical_facilities_location 
  ON medical_facilities USING btree (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_medical_facilities_type 
  ON medical_facilities USING btree (type);

CREATE INDEX IF NOT EXISTS idx_eps_facility_partnerships_eps_id 
  ON eps_facility_partnerships USING btree (eps_id);

CREATE INDEX IF NOT EXISTS idx_eps_facility_partnerships_facility_id 
  ON eps_facility_partnerships USING btree (facility_id);

-- Insertar datos de ejemplo de EPS
INSERT INTO eps (name, logo_url) VALUES
  ('Salud Total EPS S.A.', '/assets/logos/salud_total_eps.jpg'),
  ('EPS Sanitas', '/assets/logos/eps_sanitas.jpg'),
  ('EPS Sura', '/assets/logos/eps_sura.jpg'),
  ('Famisanar EPS', '/assets/logos/famisanar_eps.jpg'),
  ('Compensar EPS', '/assets/logos/compensar_eps.jpg'),
  ('Nueva EPS', '/assets/logos/nueva_eps.jpg'),
  ('Aliansalud EPS', '/assets/logos/aliansalud_eps.jpg'),
  ('Servicio Occidental de Salud (S.O.S.)', '/assets/logos/sos_eps.jpg'),
  ('Comfenalco Valle EPS', '/assets/logos/comfenalco_valle_eps.jpg'),
  ('Coosalud EPS-S', '/assets/logos/coosalud_eps.jpg'),
  ('Mutual Ser EPS', '/assets/logos/mutual_ser_eps.jpg'),
  ('Capital Salud EPS', '/assets/logos/capital_salud_eps.jpg'),
  ('Savia Salud EPS', '/assets/logos/savia_salud_eps.jpg'),
  ('EPS Familiar de Colombia', '/assets/logos/eps_familiar_colombia.jpg'),
  ('Asmet Salud', '/assets/logos/asmet_salud.jpg'),
  ('Emssanar E.S.S.', '/assets/logos/emssanar_eps.jpg'),
  ('Comfachocó EPS', '/assets/logos/comfachoco_eps.jpg'),
  ('Dusakawi EPS', '/assets/logos/dusakawi_eps.jpg'),
  ('Salud Bolívar EPS SAS', '/assets/logos/salud_bolivar_eps.jpg'),
  ('Pijaos Salud EPSI', '/assets/logos/pijaos_salud_eps.jpg'),
  ('AIC EPSI (Asociación Indígena del Cauca)', '/assets/logos/aic_eps.jpg')
ON CONFLICT (name) DO NOTHING;

-- Insertar datos de ejemplo de centros médicos en Bogotá
INSERT INTO medical_facilities (name, type, address, latitude, longitude, phone, services, photo_url) VALUES
  ('Hospital Universitario San Ignacio', 'Hospital', 'Carrera 7 No. 40-62, Bogotá', 4.6280, -74.0647, '+57 1 594 6161', ARRAY['Urgencias', 'Cirugía', 'Medicina Interna', 'Pediatría'], 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg'),
  ('Clínica del Country', 'Clínica', 'Carrera 16 No. 82-57, Bogotá', 4.6692, -74.0563, '+57 1 530 0470', ARRAY['Cirugía Estética', 'Cardiología', 'Oncología'], 'https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg'),
  ('Hospital El Tunal', 'Hospital', 'Carrera 20 No. 47B-35 Sur, Bogotá', 4.5756, -74.1372, '+57 1 754 8026', ARRAY['Urgencias', 'Medicina General', 'Ginecología'], 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg'),
  ('IPS Universitaria León XIII', 'IPS', 'Calle 78 No. 69-04, Bogotá', 4.6692, -74.0943, '+57 1 430 5050', ARRAY['Consulta Externa', 'Laboratorio', 'Radiología'], 'https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg'),
  ('Centro de Salud Chapinero', 'Centro de Salud', 'Carrera 13 No. 54-24, Bogotá', 4.6486, -74.0676, '+57 1 249 6060', ARRAY['Medicina General', 'Vacunación', 'Odontología'], 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg'),
  ('Clínica Reina Sofía', 'Clínica', 'Calle 127 No. 21-05, Bogotá', 4.7110, -74.0498, '+57 1 274 2727', ARRAY['Cirugía', 'Medicina Interna', 'Pediatría'], 'https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg'),
  ('Hospital Simón Bolívar', 'Hospital', 'Avenida Villavicencio, Bogotá', 4.6097, -74.1469, '+57 1 364 4444', ARRAY['Urgencias', 'Trauma', 'Cuidados Intensivos'], 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg'),
  ('IPS Salud Total Zona Rosa', 'IPS', 'Carrera 14 No. 93A-07, Bogotá', 4.6776, -74.0563, '+57 1 644 4444', ARRAY['Consulta Externa', 'Especialistas', 'Laboratorio'], 'https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg')
ON CONFLICT DO NOTHING;

-- Crear relaciones de ejemplo entre EPS y centros médicos
DO $$
DECLARE
  salud_total_id uuid;
  sanitas_id uuid;
  sura_id uuid;
  hospital_san_ignacio_id uuid;
  clinica_country_id uuid;
  hospital_tunal_id uuid;
  ips_leon_xiii_id uuid;
  centro_chapinero_id uuid;
  clinica_reina_sofia_id uuid;
  hospital_simon_bolivar_id uuid;
  ips_salud_total_id uuid;
BEGIN
  -- Obtener IDs de EPS
  SELECT id INTO salud_total_id FROM eps WHERE name = 'Salud Total EPS S.A.';
  SELECT id INTO sanitas_id FROM eps WHERE name = 'EPS Sanitas';
  SELECT id INTO sura_id FROM eps WHERE name = 'EPS Sura';
  
  -- Obtener IDs de centros médicos
  SELECT id INTO hospital_san_ignacio_id FROM medical_facilities WHERE name = 'Hospital Universitario San Ignacio';
  SELECT id INTO clinica_country_id FROM medical_facilities WHERE name = 'Clínica del Country';
  SELECT id INTO hospital_tunal_id FROM medical_facilities WHERE name = 'Hospital El Tunal';
  SELECT id INTO ips_leon_xiii_id FROM medical_facilities WHERE name = 'IPS Universitaria León XIII';
  SELECT id INTO centro_chapinero_id FROM medical_facilities WHERE name = 'Centro de Salud Chapinero';
  SELECT id INTO clinica_reina_sofia_id FROM medical_facilities WHERE name = 'Clínica Reina Sofía';
  SELECT id INTO hospital_simon_bolivar_id FROM medical_facilities WHERE name = 'Hospital Simón Bolívar';
  SELECT id INTO ips_salud_total_id FROM medical_facilities WHERE name = 'IPS Salud Total Zona Rosa';
  
  -- Crear relaciones para Salud Total
  INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
    (salud_total_id, hospital_san_ignacio_id),
    (salud_total_id, clinica_country_id),
    (salud_total_id, ips_salud_total_id),
    (salud_total_id, centro_chapinero_id)
  ON CONFLICT DO NOTHING;
  
  -- Crear relaciones para Sanitas
  INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
    (sanitas_id, hospital_tunal_id),
    (sanitas_id, clinica_reina_sofia_id),
    (sanitas_id, ips_leon_xiii_id),
    (sanitas_id, centro_chapinero_id)
  ON CONFLICT DO NOTHING;
  
  -- Crear relaciones para Sura
  INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
    (sura_id, hospital_simon_bolivar_id),
    (sura_id, clinica_country_id),
    (sura_id, ips_leon_xiii_id),
    (sura_id, hospital_san_ignacio_id)
  ON CONFLICT DO NOTHING;
END $$;
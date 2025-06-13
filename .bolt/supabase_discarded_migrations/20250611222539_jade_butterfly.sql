/*
  # Medical Facilities and EPS Integration Schema

  1. New Tables
    - `aliados_medicos` (already exists - medical facilities/partners)
    - `eps` (already exists - health insurance providers)
    - `eps_facility_partnerships` (new - relationships between EPS and medical facilities)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user write access

  3. Data Population
    - Insert sample EPS data
    - Insert sample medical facilities data
    - Create partnerships between EPS and facilities

  4. Indexes
    - Optimize location-based queries
    - Optimize partnership lookups
*/

-- Create partnerships table (eps and aliados_medicos already exist)
CREATE TABLE IF NOT EXISTS eps_facility_partnerships (
  eps_id uuid REFERENCES eps(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES aliados_medicos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (eps_id, facility_id)
);

-- Enable RLS on all tables
ALTER TABLE eps ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliados_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eps_facility_partnerships ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for eps"
  ON eps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for aliados_medicos"
  ON aliados_medicos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for eps_facility_partnerships"
  ON eps_facility_partnerships
  FOR SELECT
  TO public
  USING (true);

-- Authenticated user write policies
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

CREATE POLICY "Authenticated users can insert aliados_medicos"
  ON aliados_medicos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update aliados_medicos"
  ON aliados_medicos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert partnerships"
  ON eps_facility_partnerships
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_aliados_medicos_location 
  ON aliados_medicos USING btree (latitud, longitud);

CREATE INDEX IF NOT EXISTS idx_eps_facility_partnerships_eps_id 
  ON eps_facility_partnerships USING btree (eps_id);

CREATE INDEX IF NOT EXISTS idx_eps_facility_partnerships_facility_id 
  ON eps_facility_partnerships USING btree (facility_id);

-- Add missing columns to eps table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'eps' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE eps ADD COLUMN logo_url text;
  END IF;
END $$;

-- Insert EPS data using correct column names
INSERT INTO eps (nombre, codigo, logo_url) VALUES
  ('Salud Total EPS S.A.', 'EPS001', '/assets/logos/salud_total_eps.jpg'),
  ('EPS Sanitas', 'EPS002', '/assets/logos/eps_sanitas.jpg'),
  ('EPS Sura', 'EPS003', '/assets/logos/eps_sura.jpg'),
  ('Famisanar EPS', 'EPS004', '/assets/logos/famisanar_eps.jpg'),
  ('Compensar EPS', 'EPS005', '/assets/logos/compensar_eps.jpg'),
  ('Nueva EPS', 'EPS006', '/assets/logos/nueva_eps.jpg'),
  ('Aliansalud EPS', 'EPS007', '/assets/logos/aliansalud_eps.jpg'),
  ('Servicio Occidental de Salud (S.O.S.)', 'EPS008', '/assets/logos/sos_eps.jpg'),
  ('Comfenalco Valle EPS', 'EPS009', '/assets/logos/comfenalco_valle_eps.jpg'),
  ('Coosalud EPS-S', 'EPS010', '/assets/logos/coosalud_eps.jpg'),
  ('Mutual Ser EPS', 'EPS011', '/assets/logos/mutual_ser_eps.jpg'),
  ('Capital Salud EPS', 'EPS012', '/assets/logos/capital_salud_eps.jpg'),
  ('Savia Salud EPS', 'EPS013', '/assets/logos/savia_salud_eps.jpg'),
  ('EPS Familiar de Colombia', 'EPS014', '/assets/logos/eps_familiar_colombia.jpg'),
  ('Asmet Salud', 'EPS015', '/assets/logos/asmet_salud.jpg'),
  ('Emssanar E.S.S.', 'EPS016', '/assets/logos/emssanar_eps.jpg'),
  ('Comfachocó EPS', 'EPS017', '/assets/logos/comfachoco_eps.jpg'),
  ('Dusakawi EPS', 'EPS018', '/assets/logos/dusakawi_eps.jpg'),
  ('Salud Bolívar EPS SAS', 'EPS019', '/assets/logos/salud_bolivar_eps.jpg'),
  ('Pijaos Salud EPSI', 'EPS020', '/assets/logos/pijaos_salud_eps.jpg'),
  ('AIC EPSI (Asociación Indígena del Cauca)', 'EPS021', '/assets/logos/aic_eps.jpg')
ON CONFLICT (nombre) DO UPDATE SET
  codigo = EXCLUDED.codigo,
  logo_url = EXCLUDED.logo_url;

-- Insert sample medical facilities data using correct column names
INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud) VALUES
  ('Hospital Universitario San Ignacio', 'Hospital', 'Carrera 7 No. 40-62', 'Bogotá', 'Cundinamarca', '+57 1 594 6161', ARRAY['Urgencias', 'Cirugía', 'Medicina Interna', 'Pediatría'], 4.6280, -74.0647),
  ('Clínica del Country', 'Clínica', 'Carrera 16 No. 82-57', 'Bogotá', 'Cundinamarca', '+57 1 530 0470', ARRAY['Cirugía Estética', 'Cardiología', 'Oncología'], 4.6692, -74.0563),
  ('Hospital El Tunal', 'Hospital', 'Carrera 20 No. 47B-35 Sur', 'Bogotá', 'Cundinamarca', '+57 1 754 8026', ARRAY['Urgencias', 'Medicina General', 'Ginecología'], 4.5756, -74.1372),
  ('IPS Universitaria León XIII', 'IPS', 'Calle 78 No. 69-04', 'Bogotá', 'Cundinamarca', '+57 1 430 5050', ARRAY['Consulta Externa', 'Laboratorio', 'Radiología'], 4.6692, -74.0943),
  ('Centro de Salud Chapinero', 'Centro de Salud', 'Carrera 13 No. 54-24', 'Bogotá', 'Cundinamarca', '+57 1 249 6060', ARRAY['Medicina General', 'Vacunación', 'Odontología'], 4.6486, -74.0676),
  ('Clínica Reina Sofía', 'Clínica', 'Calle 127 No. 21-05', 'Bogotá', 'Cundinamarca', '+57 1 274 2727', ARRAY['Cirugía', 'Medicina Interna', 'Pediatría'], 4.7110, -74.0498),
  ('Hospital Simón Bolívar', 'Hospital', 'Avenida Villavicencio', 'Bogotá', 'Cundinamarca', '+57 1 364 4444', ARRAY['Urgencias', 'Trauma', 'Cuidados Intensivos'], 4.6097, -74.1469),
  ('IPS Salud Total Zona Rosa', 'IPS', 'Carrera 14 No. 93A-07', 'Bogotá', 'Cundinamarca', '+57 1 644 4444', ARRAY['Consulta Externa', 'Especialistas', 'Laboratorio'], 4.6776, -74.0563),
  ('Hospital de La Misericordia', 'Hospital', 'Avenida Caracas No. 67-31', 'Bogotá', 'Cundinamarca', '+57 1 381 3000', ARRAY['Pediatría', 'Urgencias Pediátricas', 'Cirugía Infantil'], 4.6486, -74.0676),
  ('Clínica Marly', 'Clínica', 'Calle 50 No. 9-67', 'Bogotá', 'Cundinamarca', '+57 1 343 6600', ARRAY['Cirugía', 'Medicina Interna', 'Cardiología'], 4.6280, -74.0647),
  ('Hospital Universitario Nacional', 'Hospital', 'Carrera 30 No. 45-03', 'Bogotá', 'Cundinamarca', '+57 1 316 5000', ARRAY['Urgencias', 'Medicina General', 'Especialidades'], 4.6280, -74.0830),
  ('IPS Sanitas Chapinero', 'IPS', 'Carrera 19 No. 84-14', 'Bogotá', 'Cundinamarca', '+57 1 650 8000', ARRAY['Consulta Externa', 'Laboratorio', 'Imágenes Diagnósticas'], 4.6692, -74.0563)
ON CONFLICT DO NOTHING;

-- Create partnerships between EPS and medical facilities
DO $$
DECLARE
  salud_total_id uuid;
  sanitas_id uuid;
  sura_id uuid;
  famisanar_id uuid;
  compensar_id uuid;
  
  hospital_san_ignacio_id uuid;
  clinica_country_id uuid;
  hospital_tunal_id uuid;
  ips_leon_xiii_id uuid;
  centro_chapinero_id uuid;
  clinica_reina_sofia_id uuid;
  hospital_simon_bolivar_id uuid;
  ips_salud_total_id uuid;
  hospital_misericordia_id uuid;
  clinica_marly_id uuid;
  hospital_nacional_id uuid;
  ips_sanitas_id uuid;
BEGIN
  -- Get EPS IDs
  SELECT id INTO salud_total_id FROM eps WHERE nombre = 'Salud Total EPS S.A.';
  SELECT id INTO sanitas_id FROM eps WHERE nombre = 'EPS Sanitas';
  SELECT id INTO sura_id FROM eps WHERE nombre = 'EPS Sura';
  SELECT id INTO famisanar_id FROM eps WHERE nombre = 'Famisanar EPS';
  SELECT id INTO compensar_id FROM eps WHERE nombre = 'Compensar EPS';
  
  -- Get medical facility IDs
  SELECT id INTO hospital_san_ignacio_id FROM aliados_medicos WHERE nombre = 'Hospital Universitario San Ignacio';
  SELECT id INTO clinica_country_id FROM aliados_medicos WHERE nombre = 'Clínica del Country';
  SELECT id INTO hospital_tunal_id FROM aliados_medicos WHERE nombre = 'Hospital El Tunal';
  SELECT id INTO ips_leon_xiii_id FROM aliados_medicos WHERE nombre = 'IPS Universitaria León XIII';
  SELECT id INTO centro_chapinero_id FROM aliados_medicos WHERE nombre = 'Centro de Salud Chapinero';
  SELECT id INTO clinica_reina_sofia_id FROM aliados_medicos WHERE nombre = 'Clínica Reina Sofía';
  SELECT id INTO hospital_simon_bolivar_id FROM aliados_medicos WHERE nombre = 'Hospital Simón Bolívar';
  SELECT id INTO ips_salud_total_id FROM aliados_medicos WHERE nombre = 'IPS Salud Total Zona Rosa';
  SELECT id INTO hospital_misericordia_id FROM aliados_medicos WHERE nombre = 'Hospital de La Misericordia';
  SELECT id INTO clinica_marly_id FROM aliados_medicos WHERE nombre = 'Clínica Marly';
  SELECT id INTO hospital_nacional_id FROM aliados_medicos WHERE nombre = 'Hospital Universitario Nacional';
  SELECT id INTO ips_sanitas_id FROM aliados_medicos WHERE nombre = 'IPS Sanitas Chapinero';
  
  -- Create partnerships for Salud Total
  IF salud_total_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
      (salud_total_id, hospital_san_ignacio_id),
      (salud_total_id, clinica_country_id),
      (salud_total_id, ips_salud_total_id),
      (salud_total_id, centro_chapinero_id),
      (salud_total_id, clinica_marly_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create partnerships for Sanitas
  IF sanitas_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
      (sanitas_id, hospital_tunal_id),
      (sanitas_id, clinica_reina_sofia_id),
      (sanitas_id, ips_leon_xiii_id),
      (sanitas_id, centro_chapinero_id),
      (sanitas_id, ips_sanitas_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create partnerships for Sura
  IF sura_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
      (sura_id, hospital_simon_bolivar_id),
      (sura_id, clinica_country_id),
      (sura_id, ips_leon_xiii_id),
      (sura_id, hospital_san_ignacio_id),
      (sura_id, hospital_nacional_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create partnerships for Famisanar
  IF famisanar_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
      (famisanar_id, hospital_misericordia_id),
      (famisanar_id, centro_chapinero_id),
      (famisanar_id, hospital_tunal_id),
      (famisanar_id, clinica_marly_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create partnerships for Compensar
  IF compensar_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id) VALUES
      (compensar_id, hospital_nacional_id),
      (compensar_id, clinica_reina_sofia_id),
      (compensar_id, centro_chapinero_id),
      (compensar_id, hospital_simon_bolivar_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
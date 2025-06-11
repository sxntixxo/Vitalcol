/*
  # Database Setup for EPS and Medical Facilities Integration

  1. New Tables
    - `eps_facility_partnerships` - Links EPS with their partner medical facilities

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user write access

  3. Data Population
    - Insert EPS data with logos
    - Insert sample medical facilities in Bogotá
    - Create partnerships between EPS and facilities

  4. Optimizations
    - Add indexes for location-based queries
    - Add indexes for partnership lookups
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

-- Insert EPS data using INSERT with WHERE NOT EXISTS to avoid conflicts
INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Salud Total EPS S.A.', 'EPS001', '/assets/logos/salud_total_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Salud Total EPS S.A.');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'EPS Sanitas', 'EPS002', '/assets/logos/eps_sanitas.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'EPS Sanitas');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'EPS Sura', 'EPS003', '/assets/logos/eps_sura.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'EPS Sura');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Famisanar EPS', 'EPS004', '/assets/logos/famisanar_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Famisanar EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Compensar EPS', 'EPS005', '/assets/logos/compensar_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Compensar EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Nueva EPS', 'EPS006', '/assets/logos/nueva_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Nueva EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Aliansalud EPS', 'EPS007', '/assets/logos/aliansalud_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Aliansalud EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Servicio Occidental de Salud (S.O.S.)', 'EPS008', '/assets/logos/sos_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Servicio Occidental de Salud (S.O.S.)');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Comfenalco Valle EPS', 'EPS009', '/assets/logos/comfenalco_valle_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Comfenalco Valle EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Coosalud EPS-S', 'EPS010', '/assets/logos/coosalud_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Coosalud EPS-S');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Mutual Ser EPS', 'EPS011', '/assets/logos/mutual_ser_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Mutual Ser EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Capital Salud EPS', 'EPS012', '/assets/logos/capital_salud_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Capital Salud EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Savia Salud EPS', 'EPS013', '/assets/logos/savia_salud_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Savia Salud EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'EPS Familiar de Colombia', 'EPS014', '/assets/logos/eps_familiar_colombia.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'EPS Familiar de Colombia');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Asmet Salud', 'EPS015', '/assets/logos/asmet_salud.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Asmet Salud');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Emssanar E.S.S.', 'EPS016', '/assets/logos/emssanar_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Emssanar E.S.S.');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Comfachocó EPS', 'EPS017', '/assets/logos/comfachoco_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Comfachocó EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Dusakawi EPS', 'EPS018', '/assets/logos/dusakawi_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Dusakawi EPS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Salud Bolívar EPS SAS', 'EPS019', '/assets/logos/salud_bolivar_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Salud Bolívar EPS SAS');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'Pijaos Salud EPSI', 'EPS020', '/assets/logos/pijaos_salud_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'Pijaos Salud EPSI');

INSERT INTO eps (nombre, codigo, logo_url)
SELECT 'AIC EPSI (Asociación Indígena del Cauca)', 'EPS021', '/assets/logos/aic_eps.jpg'
WHERE NOT EXISTS (SELECT 1 FROM eps WHERE nombre = 'AIC EPSI (Asociación Indígena del Cauca)');

-- Insert sample medical facilities data using WHERE NOT EXISTS to avoid conflicts
INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Hospital Universitario San Ignacio', 'Hospital', 'Carrera 7 No. 40-62', 'Bogotá', 'Cundinamarca', '+57 1 594 6161', ARRAY['Urgencias', 'Cirugía', 'Medicina Interna', 'Pediatría'], 4.6280, -74.0647
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Hospital Universitario San Ignacio');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Clínica del Country', 'Clínica', 'Carrera 16 No. 82-57', 'Bogotá', 'Cundinamarca', '+57 1 530 0470', ARRAY['Cirugía Estética', 'Cardiología', 'Oncología'], 4.6692, -74.0563
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Clínica del Country');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Hospital El Tunal', 'Hospital', 'Carrera 20 No. 47B-35 Sur', 'Bogotá', 'Cundinamarca', '+57 1 754 8026', ARRAY['Urgencias', 'Medicina General', 'Ginecología'], 4.5756, -74.1372
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Hospital El Tunal');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'IPS Universitaria León XIII', 'IPS', 'Calle 78 No. 69-04', 'Bogotá', 'Cundinamarca', '+57 1 430 5050', ARRAY['Consulta Externa', 'Laboratorio', 'Radiología'], 4.6692, -74.0943
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'IPS Universitaria León XIII');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Centro de Salud Chapinero', 'Centro de Salud', 'Carrera 13 No. 54-24', 'Bogotá', 'Cundinamarca', '+57 1 249 6060', ARRAY['Medicina General', 'Vacunación', 'Odontología'], 4.6486, -74.0676
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Centro de Salud Chapinero');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Clínica Reina Sofía', 'Clínica', 'Calle 127 No. 21-05', 'Bogotá', 'Cundinamarca', '+57 1 274 2727', ARRAY['Cirugía', 'Medicina Interna', 'Pediatría'], 4.7110, -74.0498
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Clínica Reina Sofía');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Hospital Simón Bolívar', 'Hospital', 'Avenida Villavicencio', 'Bogotá', 'Cundinamarca', '+57 1 364 4444', ARRAY['Urgencias', 'Trauma', 'Cuidados Intensivos'], 4.6097, -74.1469
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Hospital Simón Bolívar');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'IPS Salud Total Zona Rosa', 'IPS', 'Carrera 14 No. 93A-07', 'Bogotá', 'Cundinamarca', '+57 1 644 4444', ARRAY['Consulta Externa', 'Especialistas', 'Laboratorio'], 4.6776, -74.0563
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'IPS Salud Total Zona Rosa');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Hospital de La Misericordia', 'Hospital', 'Avenida Caracas No. 67-31', 'Bogotá', 'Cundinamarca', '+57 1 381 3000', ARRAY['Pediatría', 'Urgencias Pediátricas', 'Cirugía Infantil'], 4.6486, -74.0676
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Hospital de La Misericordia');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Clínica Marly', 'Clínica', 'Calle 50 No. 9-67', 'Bogotá', 'Cundinamarca', '+57 1 343 6600', ARRAY['Cirugía', 'Medicina Interna', 'Cardiología'], 4.6280, -74.0647
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Clínica Marly');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'Hospital Universitario Nacional', 'Hospital', 'Carrera 30 No. 45-03', 'Bogotá', 'Cundinamarca', '+57 1 316 5000', ARRAY['Urgencias', 'Medicina General', 'Especialidades'], 4.6280, -74.0830
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'Hospital Universitario Nacional');

INSERT INTO aliados_medicos (nombre, tipo, direccion, ciudad, departamento, telefono, servicios, latitud, longitud)
SELECT 'IPS Sanitas Chapinero', 'IPS', 'Carrera 19 No. 84-14', 'Bogotá', 'Cundinamarca', '+57 1 650 8000', ARRAY['Consulta Externa', 'Laboratorio', 'Imágenes Diagnósticas'], 4.6692, -74.0563
WHERE NOT EXISTS (SELECT 1 FROM aliados_medicos WHERE nombre = 'IPS Sanitas Chapinero');

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
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT salud_total_id, hospital_san_ignacio_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = salud_total_id AND facility_id = hospital_san_ignacio_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT salud_total_id, clinica_country_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = salud_total_id AND facility_id = clinica_country_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT salud_total_id, ips_salud_total_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = salud_total_id AND facility_id = ips_salud_total_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT salud_total_id, centro_chapinero_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = salud_total_id AND facility_id = centro_chapinero_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT salud_total_id, clinica_marly_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = salud_total_id AND facility_id = clinica_marly_id);
  END IF;
  
  -- Create partnerships for Sanitas
  IF sanitas_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sanitas_id, hospital_tunal_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sanitas_id AND facility_id = hospital_tunal_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sanitas_id, clinica_reina_sofia_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sanitas_id AND facility_id = clinica_reina_sofia_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sanitas_id, ips_leon_xiii_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sanitas_id AND facility_id = ips_leon_xiii_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sanitas_id, centro_chapinero_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sanitas_id AND facility_id = centro_chapinero_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sanitas_id, ips_sanitas_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sanitas_id AND facility_id = ips_sanitas_id);
  END IF;
  
  -- Create partnerships for Sura
  IF sura_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sura_id, hospital_simon_bolivar_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sura_id AND facility_id = hospital_simon_bolivar_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sura_id, clinica_country_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sura_id AND facility_id = clinica_country_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sura_id, ips_leon_xiii_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sura_id AND facility_id = ips_leon_xiii_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sura_id, hospital_san_ignacio_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sura_id AND facility_id = hospital_san_ignacio_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT sura_id, hospital_nacional_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = sura_id AND facility_id = hospital_nacional_id);
  END IF;
  
  -- Create partnerships for Famisanar
  IF famisanar_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT famisanar_id, hospital_misericordia_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = famisanar_id AND facility_id = hospital_misericordia_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT famisanar_id, centro_chapinero_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = famisanar_id AND facility_id = centro_chapinero_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT famisanar_id, hospital_tunal_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = famisanar_id AND facility_id = hospital_tunal_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT famisanar_id, clinica_marly_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = famisanar_id AND facility_id = clinica_marly_id);
  END IF;
  
  -- Create partnerships for Compensar
  IF compensar_id IS NOT NULL THEN
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT compensar_id, hospital_nacional_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = compensar_id AND facility_id = hospital_nacional_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT compensar_id, clinica_reina_sofia_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = compensar_id AND facility_id = clinica_reina_sofia_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT compensar_id, centro_chapinero_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = compensar_id AND facility_id = centro_chapinero_id);
    
    INSERT INTO eps_facility_partnerships (eps_id, facility_id)
    SELECT compensar_id, hospital_simon_bolivar_id
    WHERE NOT EXISTS (SELECT 1 FROM eps_facility_partnerships WHERE eps_id = compensar_id AND facility_id = hospital_simon_bolivar_id);
  END IF;
END $$;
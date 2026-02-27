/*
  # Create Workers Management Tables

  ## 1. New Tables

  ### `workers`
  Main workers table storing all employee information including personal, professional, contract, vacation, and document data.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique worker identifier
  - `worker_code` (text, unique) - Worker code (e.g., OP-001)
  - `first_name` (text) - First name
  - `last_name` (text) - Last name
  - `dni` (text) - National ID
  - `dni_expiry_date` (date) - ID expiry date
  - `address` (text) - Street address
  - `city` (text) - City
  - `postal_code` (text) - Postal code
  - `phone` (text) - Phone number
  - `email` (text) - Email address
  - `emergency_contact` (text) - Emergency contact name
  - `emergency_phone` (text) - Emergency contact phone
  - `has_driver_license` (boolean) - Has driver's license
  - `has_own_vehicle` (boolean) - Has own vehicle
  - `category` (text) - Worker category (Oficial, Ayudante, Peón, Maquinista, Especialista)
  - `prl_type` (text) - PRL type
  - `prl_training` (jsonb) - PRL training courses array
  - `prl_expiry_date` (date) - PRL expiry date
  - `medical_check_date` (date) - Medical check date
  - `medical_check_expiry` (date) - Medical check expiry date
  - `epi_delivery_date` (date) - EPI delivery date
  - `contract_type` (text) - Contract type (hourly/monthly)
  - `hourly_rate` (numeric) - Hourly rate
  - `monthly_rate` (numeric) - Monthly rate
  - `overtime_rate` (numeric) - Overtime rate
  - `hire_date` (date) - Hire date
  - `termination_date` (date) - Termination date
  - `vacation_total_days` (integer) - Total vacation days
  - `vacation_used_days` (integer) - Used vacation days
  - `vacation_pending_days` (integer) - Pending vacation days
  - `vacation_year` (integer) - Vacation year
  - `contract_signed` (boolean) - Contract signed
  - `bank_account` (text) - Bank account
  - `digital_access_username` (text) - Digital access username
  - `digital_access_password` (text) - Digital access password
  - `digital_access_has_access` (boolean) - Has digital access
  - `digital_access_last_login` (timestamptz) - Last login timestamp
  - `status` (text) - Worker status (active, inactive, vacation, sick)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (text) - Creator user
  - `updated_by` (text) - Last updater user

  ### `work_history`
  Work history tracking worker assignments to projects.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `worker_id` (uuid, foreign key) - Reference to workers table
  - `project_id` (text) - Project identifier
  - `project_name` (text) - Project name
  - `start_date` (date) - Start date
  - `end_date` (date) - End date
  - `role` (text) - Role in the project
  - `total_hours` (numeric) - Total hours worked
  - `total_earnings` (numeric) - Total earnings
  - `created_at` (timestamptz) - Creation timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Create permissive policies for public access (testing mode)

  ## 3. Indexes
  - Index on worker_code for fast lookups
  - Index on email for fast searches
  - Index on status for filtering
  - Index on category for filtering
  - Index on worker_id in work_history for joins
*/

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_code text UNIQUE NOT NULL,
  
  -- Personal data
  first_name text NOT NULL,
  last_name text NOT NULL,
  dni text NOT NULL,
  dni_expiry_date date,
  address text,
  city text,
  postal_code text,
  phone text,
  email text,
  emergency_contact text,
  emergency_phone text,
  has_driver_license boolean DEFAULT false,
  has_own_vehicle boolean DEFAULT false,
  
  -- Professional data
  category text NOT NULL CHECK (category IN ('Oficial', 'Ayudante', 'Peón', 'Maquinista', 'Especialista')),
  prl_type text,
  prl_training jsonb DEFAULT '[]'::jsonb,
  prl_expiry_date date,
  medical_check_date date,
  medical_check_expiry date,
  epi_delivery_date date,
  
  -- Contract data
  contract_type text NOT NULL CHECK (contract_type IN ('hourly', 'monthly')),
  hourly_rate numeric(10, 2),
  monthly_rate numeric(10, 2),
  overtime_rate numeric(10, 2),
  hire_date date NOT NULL,
  termination_date date,
  
  -- Vacation data
  vacation_total_days integer DEFAULT 30,
  vacation_used_days integer DEFAULT 0,
  vacation_pending_days integer DEFAULT 0,
  vacation_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Documents
  contract_signed boolean DEFAULT false,
  bank_account text,
  
  -- Digital access
  digital_access_username text,
  digital_access_password text,
  digital_access_has_access boolean DEFAULT false,
  digital_access_last_login timestamptz,
  
  -- Status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vacation', 'sick')),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

-- Create work history table
CREATE TABLE IF NOT EXISTS work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id text,
  project_name text,
  start_date date NOT NULL,
  end_date date,
  role text,
  total_hours numeric(10, 2) DEFAULT 0,
  total_earnings numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_worker_code ON workers(worker_code);
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_category ON workers(category);
CREATE INDEX IF NOT EXISTS idx_work_history_worker_id ON work_history(worker_id);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access (testing mode)
CREATE POLICY "Allow all to view workers"
  ON workers FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert workers"
  ON workers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update workers"
  ON workers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete workers"
  ON workers FOR DELETE
  USING (true);

CREATE POLICY "Allow all work history operations"
  ON work_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workers table
DROP TRIGGER IF EXISTS update_workers_updated_at ON workers;
CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

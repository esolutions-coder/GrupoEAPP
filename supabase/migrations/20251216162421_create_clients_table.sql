/*
  # Create CRM Clients Table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key) - Unique identifier
      - `code` (text, unique) - Client code (e.g., CLI-2024-001)
      - `name` (text) - Client company name
      - `contact_person` (text) - Main contact person
      - `email` (text) - Contact email
      - `phone` (text) - Contact phone
      - `address` (text) - Physical address
      - `city` (text) - City
      - `country` (text) - Country
      - `postal_code` (text) - Postal/ZIP code
      - `tax_id` (text) - Tax identification number (CIF/NIF)
      - `client_type` (text) - Type: public, private, mixed
      - `industry` (text) - Industry sector
      - `status` (text) - Status: active, inactive, potential
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_by` (text) - User who created the record
      - `updated_by` (text) - User who last updated

  2. Security
    - Enable RLS on `clients` table
    - Add policy for authenticated users to manage clients
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  country text DEFAULT 'España',
  postal_code text,
  tax_id text,
  client_type text DEFAULT 'private' CHECK (client_type IN ('public', 'private', 'mixed')),
  industry text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'potential')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON clients(client_type);

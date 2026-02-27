/*
  # Allow Public Access for Testing

  This migration temporarily allows unauthenticated access to clients and projects tables
  for testing purposes. In production, proper authentication should be implemented.

  1. Changes
    - Drop existing restrictive policies that require authentication
    - Create permissive policies that allow all operations without authentication
  
  2. Security
    - THIS IS FOR TESTING ONLY
    - In production, restore authentication requirements
    - All tables maintain RLS enabled
*/

-- Drop existing policies for clients
DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON clients;

-- Create permissive policies for clients (allow all)
CREATE POLICY "Allow all to view clients"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update clients"
  ON clients FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete clients"
  ON clients FOR DELETE
  USING (true);

-- Drop existing policies for projects
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

-- Create permissive policies for projects (allow all)
CREATE POLICY "Allow all to view projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update projects"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete projects"
  ON projects FOR DELETE
  USING (true);

-- Drop existing policies for cost control tables
DROP POLICY IF EXISTS "Users can manage cost control projects" ON cost_control_projects;
DROP POLICY IF EXISTS "Users can manage budget breakdown" ON budget_breakdown;
DROP POLICY IF EXISTS "Users can manage cost items" ON cost_items;
DROP POLICY IF EXISTS "Users can manage cost alerts" ON cost_alerts;

-- Create permissive policies for cost control tables
CREATE POLICY "Allow all cost control projects operations"
  ON cost_control_projects FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all budget breakdown operations"
  ON budget_breakdown FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all cost items operations"
  ON cost_items FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all cost alerts operations"
  ON cost_alerts FOR ALL
  USING (true)
  WITH CHECK (true);

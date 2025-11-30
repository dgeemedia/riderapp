-- migrations/002_calls_and_devices.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- rider_devices: store push tokens associated with riders
CREATE TABLE IF NOT EXISTS rider_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  push_token text NOT NULL,
  platform text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (rider_id, push_token)
);

-- calls table (idempotent)
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_type text,
  caller_id uuid,
  callee_type text,
  callee_id uuid,
  channel text,
  status text DEFAULT 'initiated',
  created_at timestamptz DEFAULT now()
);

-- 003_task_updates_calls.sql

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_by_type text DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS is_chargeable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS price_bigint bigint DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';

ALTER TABLE riders
  ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

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

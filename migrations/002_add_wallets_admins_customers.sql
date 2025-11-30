-- 002_add_wallets_admins_customers.sql

-- Admins table for dashboard users
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Customers table (if not already)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text UNIQUE,
  free_tasks_used int DEFAULT 0,
  free_credits int DEFAULT 2, -- new users start with 2 free tasks
  last_free_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Wallets generic table (owner can be rider or customer)
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_type text NOT NULL, -- 'rider' or 'customer'
  balance_bigint bigint DEFAULT 0,
  currency text DEFAULT 'NGN',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_owner ON wallets(owner_id, owner_type);

-- wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  amount_bigint bigint NOT NULL,
  type text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

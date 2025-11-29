-- migrations/002_init_extra.sql
-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  role text DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text UNIQUE,
  free_credits integer DEFAULT 2, -- initial 2 free tasks
  last_monthly_grant timestamptz NULL,
  created_at timestamptz DEFAULT now()
);

-- Wallets (used for customer and rider)
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_type text NOT NULL, -- 'customer' or 'rider'
  balance_bigint bigint DEFAULT 0, -- store in kobo (recommended) or Naira as agreed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id),
  amount_bigint bigint NOT NULL, -- positive for credit, negative for debit
  type text NOT NULL, -- 'topup'|'hold'|'capture'|'refund'|'payout'|'platform_fee'
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Extend tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS created_by_type text DEFAULT 'customer', -- 'customer'|'admin'|'platform'
  ADD COLUMN IF NOT EXISTS is_chargeable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS price_bigint bigint DEFAULT 10000, -- 10000 kobo = ₦100 (change if you store naira)
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid'; -- 'unpaid'|'held'|'paid'|'refunded'

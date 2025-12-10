-- migrations/004_food_delivery_complete.sql
-- Run this as a single migration to set up the complete food delivery schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Riders table
CREATE TABLE IF NOT EXISTS riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text,
  mypadifood_user_id text,
  is_active boolean DEFAULT true,
  is_online boolean DEFAULT false,
  last_seen_at timestamptz,
  vehicle_type text,
  vehicle_number text,
  rating decimal(3,2) DEFAULT 5.0,
  total_deliveries integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admins table for dashboard users
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Customers table (updated with better fields)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE,
  phone text UNIQUE NOT NULL,
  password_hash text,
  profile_image text,
  address jsonb DEFAULT '[]',
  default_address_id uuid,
  free_credits int DEFAULT 2,
  last_free_reset timestamptz DEFAULT now(),
  last_monthly_grant timestamptz,
  is_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer addresses table (for multiple addresses)
CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  label text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'Nigeria',
  postal_code text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wallets generic table (owner can be rider or customer)
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_type text NOT NULL, -- 'rider' or 'customer' or 'vendor'
  balance_bigint bigint DEFAULT 0,
  currency text DEFAULT 'NGN',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (owner_id, owner_type)
);

CREATE INDEX IF NOT EXISTS idx_wallet_owner ON wallets(owner_id, owner_type);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  amount_bigint bigint NOT NULL,
  type text NOT NULL, -- 'topup', 'payment', 'refund', 'withdrawal', 'commission', 'fee'
  description text,
  reference text UNIQUE,
  status text DEFAULT 'completed',
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Tasks table (for deliveries)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_platform text DEFAULT 'mypadifood',
  source_id uuid,
  pickup jsonb,
  dropoff jsonb,
  assigned_rider uuid REFERENCES riders(id),
  status text DEFAULT 'pending',
  created_by_type text DEFAULT 'customer',
  created_by uuid,
  is_chargeable boolean DEFAULT true,
  price_bigint bigint DEFAULT 10000,
  payment_status text DEFAULT 'unpaid',
  distance_km decimal(5,2),
  estimated_duration_minutes integer,
  actual_duration_minutes integer,
  started_at timestamptz,
  completed_at timestamptz,
  rider_rating integer CHECK (rider_rating >= 1 AND rider_rating <= 5),
  customer_rating integer CHECK (customer_rating >= 1 AND customer_rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rider locations
CREATE TABLE IF NOT EXISTS rider_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  lat decimal(10,8) NOT NULL,
  lng decimal(11,8) NOT NULL,
  accuracy decimal(5,2),
  heading decimal(5,2),
  speed decimal(5,2),
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rider_locations_rider_id ON rider_locations(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_locations_recorded_at ON rider_locations(recorded_at);

-- Rider devices for push notifications
CREATE TABLE IF NOT EXISTS rider_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  push_token text NOT NULL,
  platform text,
  device_id text,
  app_version text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (rider_id, push_token)
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_type text,
  caller_id uuid,
  callee_type text,
  callee_id uuid,
  channel text UNIQUE NOT NULL,
  status text DEFAULT 'initiated',
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Vendors table (updated with password for vendor portal)
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  description text,
  logo_url text,
  cover_image text,
  address jsonb NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text,
  tax_id text,
  bank_account jsonb,
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  rating decimal(3,2) DEFAULT 5.0,
  total_orders integer DEFAULT 0,
  approved_at timestamptz,
  approved_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor categories
CREATE TABLE IF NOT EXISTS vendor_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, category)
);

-- Vendor operating hours
CREATE TABLE IF NOT EXISTS vendor_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, day_of_week)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_bigint bigint NOT NULL,
  category text,
  subcategory text,
  image_url text,
  is_available boolean DEFAULT true,
  in_stock boolean DEFAULT true,
  stock_quantity integer,
  min_order_quantity integer DEFAULT 1,
  max_order_quantity integer DEFAULT 10,
  preparation_time_minutes integer,
  tags text[],
  dietary_info jsonb, -- {vegetarian: true, vegan: false, gluten_free: true, etc}
  rating decimal(3,2) DEFAULT 5.0,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product variations (sizes, colors, etc)
CREATE TABLE IF NOT EXISTS product_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_bigint bigint NOT NULL,
  in_stock boolean DEFAULT true,
  stock_quantity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product addons/extras
CREATE TABLE IF NOT EXISTS product_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_bigint bigint NOT NULL,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  rider_id uuid REFERENCES riders(id),
  status text DEFAULT 'pending', -- pending, confirmed, preparing, ready_for_pickup, picked_up, in_transit, delivered, cancelled
  total_amount_bigint bigint NOT NULL,
  subtotal_bigint bigint NOT NULL,
  delivery_fee_bigint bigint NOT NULL DEFAULT 0,
  tax_bigint bigint DEFAULT 0,
  discount_bigint bigint DEFAULT 0,
  payment_method text DEFAULT 'wallet', -- wallet, card, cash, transfer
  payment_status text DEFAULT 'pending', -- pending, paid, failed, refunded
  delivery_address jsonb NOT NULL,
  pickup_address jsonb,
  special_instructions text,
  scheduled_for timestamptz,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  cancellation_reason text,
  cancelled_by text, -- customer, vendor, admin, system
  vendor_rating integer CHECK (vendor_rating >= 1 AND vendor_rating <= 5),
  rider_rating integer CHECK (rider_rating >= 1 AND rider_rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variation_id uuid REFERENCES product_variations(id),
  quantity integer NOT NULL,
  unit_price_bigint bigint NOT NULL,
  total_price_bigint bigint NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Order item addons
CREATE TABLE IF NOT EXISTS order_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES product_addons(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price_bigint bigint NOT NULL,
  total_price_bigint bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Shopping carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (customer_id, vendor_id)
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variation_id uuid REFERENCES product_variations(id),
  quantity integer NOT NULL DEFAULT 1,
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cart_id, product_id, variation_id)
);

-- Cart item addons
CREATE TABLE IF NOT EXISTS cart_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id uuid REFERENCES cart_items(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES product_addons(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Weekly plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active', -- active, paused, cancelled, completed
  delivery_address jsonb NOT NULL,
  delivery_time_slot text, -- "12:00-13:00", "18:00-19:00", etc
  payment_method text DEFAULT 'wallet',
  total_weekly_price_bigint bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weekly plan items table
CREATE TABLE IF NOT EXISTS weekly_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id uuid REFERENCES weekly_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type text NOT NULL, -- breakfast, lunch, dinner, snack
  product_id uuid REFERENCES products(id),
  variation_id uuid REFERENCES product_variations(id),
  quantity integer NOT NULL DEFAULT 1,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Weekly plan item addons
CREATE TABLE IF NOT EXISTS weekly_plan_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_item_id uuid REFERENCES weekly_plan_items(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES product_addons(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Favorites/wishlist
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (customer_id, product_id)
);

-- Customer reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  product_id uuid REFERENCES products(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images text[],
  is_verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL, -- customer, vendor, rider, admin
  type text NOT NULL, -- order_update, payment, system, promotion
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, user_type, is_read);

-- Promotions and discounts
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL, -- percentage, fixed_amount, free_delivery
  discount_value bigint NOT NULL,
  min_order_amount bigint,
  max_discount_amount bigint,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(vendor_id, is_available, in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  year text;
  month text;
  day text;
  seq integer;
  seq_str text;
BEGIN
  year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  month := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::text, 2, '0');
  day := LPAD(EXTRACT(DAY FROM CURRENT_DATE)::text, 2, '0');
  
  -- Get next sequence for the day
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 12) AS INTEGER)), 0) + 1
  INTO seq
  FROM orders
  WHERE order_number LIKE 'MF-' || year || month || day || '-%';
  
  seq_str := LPAD(seq::text, 4, '0');
  
  RETURN 'MF-' || year || month || day || '-' || seq_str;
END;
$$ LANGUAGE plpgsql;
-- Clean setup migration - drops and recreates everything
-- Use this if you're having migration issues

-- Drop all tables in correct order (to avoid foreign key constraints)
DROP TABLE IF EXISTS weekly_plan_item_addons CASCADE;
DROP TABLE IF EXISTS weekly_plan_items CASCADE;
DROP TABLE IF EXISTS weekly_plans CASCADE;
DROP TABLE IF EXISTS cart_item_addons CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS order_item_addons CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_addons CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendor_hours CASCADE;
DROP TABLE IF EXISTS vendor_categories CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS rider_performance CASCADE;
DROP TABLE IF EXISTS rider_ratings CASCADE;
DROP TABLE IF EXISTS rider_earnings CASCADE;
DROP TABLE IF EXISTS rider_zones CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS task_offers CASCADE;
DROP TABLE IF EXISTS rider_preferences CASCADE;
DROP TABLE IF EXISTS rider_schedule CASCADE;
DROP TABLE IF EXISTS rider_vehicles CASCADE;
DROP TABLE IF EXISTS rider_documents CASCADE;
DROP TABLE IF EXISTS rider_locations CASCADE;
DROP TABLE IF EXISTS rider_devices CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS riders CASCADE;

DROP VIEW IF EXISTS rider_dashboard_stats;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Riders table
CREATE TABLE riders (
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
  total_distance_km decimal(10,2) DEFAULT 0,
  total_hours_worked decimal(10,2) DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 5.0,
  cancellation_rate decimal(5,2) DEFAULT 0,
  acceptance_rate decimal(5,2) DEFAULT 100,
  on_time_delivery_rate decimal(5,2) DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admins table
CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE customers (
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

-- Customer addresses table
CREATE TABLE customer_addresses (
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

-- Wallets table
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_type text NOT NULL,
  balance_bigint bigint DEFAULT 0,
  currency text DEFAULT 'NGN',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (owner_id, owner_type)
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  amount_bigint bigint NOT NULL,
  type text NOT NULL,
  description text,
  reference text UNIQUE,
  status text DEFAULT 'completed',
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
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
CREATE TABLE rider_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  lat decimal(10,8) NOT NULL,
  lng decimal(11,8) NOT NULL,
  accuracy decimal(5,2),
  heading decimal(5,2),
  speed decimal(5,2),
  recorded_at timestamptz DEFAULT now()
);

-- Rider devices
CREATE TABLE rider_devices (
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
CREATE TABLE calls (
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

-- Vendors table
CREATE TABLE vendors (
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
CREATE TABLE vendor_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, category)
);

-- Vendor operating hours
CREATE TABLE vendor_hours (
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
CREATE TABLE products (
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
  dietary_info jsonb,
  rating decimal(3,2) DEFAULT 5.0,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product variations
CREATE TABLE product_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_bigint bigint NOT NULL,
  in_stock boolean DEFAULT true,
  stock_quantity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product addons
CREATE TABLE product_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_bigint bigint NOT NULL,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  rider_id uuid REFERENCES riders(id),
  status text DEFAULT 'pending',
  total_amount_bigint bigint NOT NULL,
  subtotal_bigint bigint NOT NULL,
  delivery_fee_bigint bigint NOT NULL DEFAULT 0,
  tax_bigint bigint DEFAULT 0,
  discount_bigint bigint DEFAULT 0,
  payment_method text DEFAULT 'wallet',
  payment_status text DEFAULT 'pending',
  delivery_address jsonb NOT NULL,
  pickup_address jsonb,
  special_instructions text,
  scheduled_for timestamptz,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  cancellation_reason text,
  cancelled_by text,
  vendor_rating integer CHECK (vendor_rating >= 1 AND vendor_rating <= 5),
  rider_rating integer CHECK (rider_rating >= 1 AND rider_rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
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
CREATE TABLE order_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES product_addons(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price_bigint bigint NOT NULL,
  total_price_bigint bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Shopping carts
CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (customer_id, vendor_id)
);

-- Cart items
CREATE TABLE cart_items (
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
CREATE TABLE cart_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id uuid REFERENCES cart_items(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES product_addons(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Weekly plans table
CREATE TABLE weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active',
  delivery_address jsonb NOT NULL,
  delivery_time_slot text,
  payment_method text DEFAULT 'wallet',
  total_weekly_price_bigint bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weekly plan items table
CREATE TABLE weekly_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id uuid REFERENCES weekly_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type text NOT NULL,
  product_id uuid REFERENCES products(id),
  variation_id uuid REFERENCES product_variations(id),
  quantity integer NOT NULL DEFAULT 1,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Weekly plan item addons
CREATE TABLE weekly_plan_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_item_id uuid REFERENCES weekly_plan_items(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES product_addons(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Favorites/wishlist
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (customer_id, product_id)
);

-- Customer reviews
CREATE TABLE reviews (
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
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Promotions and discounts
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL,
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

-- Rider documents
CREATE TABLE rider_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_number text,
  front_image_url text,
  back_image_url text,
  expiry_date date,
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES admins(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rider vehicle information
CREATE TABLE rider_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  make text,
  model text,
  year integer,
  color text,
  plate_number text UNIQUE,
  insurance_number text,
  insurance_expiry date,
  registration_image_url text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rider availability schedule
CREATE TABLE rider_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (rider_id, day_of_week)
);

-- Rider preferences
CREATE TABLE rider_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE UNIQUE,
  max_distance_km decimal(5,2) DEFAULT 20,
  min_earning_per_trip bigint DEFAULT 10000,
  preferred_zones text[],
  auto_accept_tasks boolean DEFAULT false,
  notification_sounds boolean DEFAULT true,
  notification_vibrate boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task offers
CREATE TABLE task_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  offered_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + INTERVAL '2 minutes'),
  status text DEFAULT 'pending',
  response_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (task_id, rider_id)
);

-- Delivery zones
CREATE TABLE delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  polygon_coordinates jsonb NOT NULL,
  is_active boolean DEFAULT true,
  delivery_fee_bigint bigint NOT NULL,
  min_order_amount_bigint bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rider zone preferences
CREATE TABLE rider_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES delivery_zones(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (rider_id, zone_id)
);

-- Earnings breakdown
CREATE TABLE rider_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  amount_bigint bigint NOT NULL,
  type text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  payment_method text,
  transaction_reference text,
  created_at timestamptz DEFAULT now()
);

-- Rider ratings from customers
CREATE TABLE rider_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  delivery_speed_rating integer CHECK (delivery_speed_rating >= 1 AND delivery_speed_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating integer CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE (order_id)
);

-- Rider performance metrics
CREATE TABLE rider_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  cancelled_tasks integer DEFAULT 0,
  total_earnings_bigint bigint DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0,
  total_distance_km decimal(10,2) DEFAULT 0,
  total_hours_worked decimal(5,2) DEFAULT 0,
  on_time_deliveries integer DEFAULT 0,
  late_deliveries integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (rider_id, date)
);

-- Create indexes
CREATE INDEX idx_wallet_owner ON wallets(owner_id, owner_type);
CREATE INDEX idx_rider_locations_rider_id ON rider_locations(rider_id);
CREATE INDEX idx_rider_locations_recorded_at ON rider_locations(recorded_at);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(vendor_id, is_available, in_stock);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, user_type, is_read);
CREATE INDEX idx_task_offers_rider ON task_offers(rider_id, status);
CREATE INDEX idx_task_offers_expires ON task_offers(expires_at) WHERE status = 'pending';
CREATE INDEX idx_rider_earnings_rider ON rider_earnings(rider_id, created_at);
CREATE INDEX idx_rider_earnings_status ON rider_earnings(status) WHERE status = 'pending';
CREATE INDEX idx_riders_is_online ON riders(is_online) WHERE is_online = true;
CREATE INDEX idx_riders_is_active ON riders(is_active) WHERE is_active = true;
CREATE INDEX idx_tasks_status ON tasks(status) WHERE status IN ('pending', 'assigned', 'accepted');
CREATE INDEX idx_tasks_assigned_rider ON tasks(assigned_rider) WHERE assigned_rider IS NOT NULL;
CREATE INDEX idx_orders_rider ON orders(rider_id) WHERE rider_id IS NOT NULL;
CREATE INDEX idx_orders_status_delivery ON orders(status) WHERE status IN ('ready_for_pickup', 'picked_up', 'in_transit');

-- Create view for rider dashboard stats
CREATE OR REPLACE VIEW rider_dashboard_stats AS
SELECT 
  r.id as rider_id,
  r.name,
  r.phone,
  r.rating as current_rating,
  r.total_deliveries,
  COALESCE(w.balance_bigint, 0) as wallet_balance,
  COALESCE(SUM(CASE WHEN re.status = 'completed' THEN re.amount_bigint ELSE 0 END), 0) as total_earnings,
  COALESCE(COUNT(DISTINCT t.id), 0) as today_tasks,
  COALESCE(AVG(rr.rating), 5.0) as average_rating_last_7_days
FROM riders r
LEFT JOIN wallets w ON w.owner_id = r.id AND w.owner_type = 'rider'
LEFT JOIN tasks t ON t.assigned_rider = r.id AND DATE(t.created_at) = CURRENT_DATE
LEFT JOIN rider_earnings re ON re.rider_id = r.id AND re.status = 'completed'
LEFT JOIN rider_ratings rr ON rr.rider_id = r.id AND rr.created_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE r.is_active = true
GROUP BY r.id, r.name, r.phone, r.rating, r.total_deliveries, w.balance_bigint;

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

-- Insert some sample data (optional)
INSERT INTO admins (email, name, password_hash) VALUES 
('admin@mypadifood.com', 'Admin User', '$2b$10$yourhashedpasswordhere') 
ON CONFLICT (email) DO NOTHING;

-- Set default order number for existing orders if needed
UPDATE orders SET order_number = generate_order_number() WHERE order_number IS NULL;
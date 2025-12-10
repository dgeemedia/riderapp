-- migrations/005_rider_features.sql
-- Additional tables and columns for rider features

-- Rider statistics
ALTER TABLE riders ADD COLUMN IF NOT EXISTS total_distance_km decimal(10,2) DEFAULT 0;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS total_hours_worked decimal(10,2) DEFAULT 0;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS average_rating decimal(3,2) DEFAULT 5.0;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS cancellation_rate decimal(5,2) DEFAULT 0;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS acceptance_rate decimal(5,2) DEFAULT 100;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS on_time_delivery_rate decimal(5,2) DEFAULT 100;

-- Rider documents (for verification)
CREATE TABLE IF NOT EXISTS rider_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- id_card, license, vehicle_registration, etc
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
CREATE TABLE IF NOT EXISTS rider_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL, -- motorcycle, bicycle, car, van
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
CREATE TABLE IF NOT EXISTS rider_schedule (
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
CREATE TABLE IF NOT EXISTS rider_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE UNIQUE,
  max_distance_km decimal(5,2) DEFAULT 20,
  min_earning_per_trip bigint DEFAULT 10000,
  preferred_zones text[], -- Array of preferred delivery zones
  auto_accept_tasks boolean DEFAULT false,
  notification_sounds boolean DEFAULT true,
  notification_vibrate boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task offers (for riders to accept/reject)
CREATE TABLE IF NOT EXISTS task_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  offered_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + INTERVAL '2 minutes'),
  status text DEFAULT 'pending', -- pending, accepted, rejected, expired
  response_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (task_id, rider_id)
);

CREATE INDEX IF NOT EXISTS idx_task_offers_rider ON task_offers(rider_id, status);
CREATE INDEX IF NOT EXISTS idx_task_offers_expires ON task_offers(expires_at) WHERE status = 'pending';

-- Delivery zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  polygon_coordinates jsonb NOT NULL, -- GeoJSON polygon
  is_active boolean DEFAULT true,
  delivery_fee_bigint bigint NOT NULL,
  min_order_amount_bigint bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rider zone preferences
CREATE TABLE IF NOT EXISTS rider_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES delivery_zones(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (rider_id, zone_id)
);

-- Earnings breakdown
CREATE TABLE IF NOT EXISTS rider_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  amount_bigint bigint NOT NULL,
  type text NOT NULL, -- delivery_fee, tip, bonus, incentive, adjustment
  description text,
  status text DEFAULT 'pending', -- pending, processing, completed, cancelled
  paid_at timestamptz,
  payment_method text,
  transaction_reference text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rider_earnings_rider ON rider_earnings(rider_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rider_earnings_status ON rider_earnings(status) WHERE status = 'pending';

-- Rider ratings from customers
CREATE TABLE IF NOT EXISTS rider_ratings (
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
CREATE TABLE IF NOT EXISTS rider_performance (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_riders_is_online ON riders(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_riders_is_active ON riders(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status) WHERE status IN ('pending', 'assigned', 'accepted');
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_rider ON tasks(assigned_rider) WHERE assigned_rider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id) WHERE rider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE status IN ('ready_for_pickup', 'picked_up', 'in_transit');

-- Create view for rider dashboard stats
CREATE OR REPLACE VIEW rider_dashboard_stats AS
SELECT 
  r.id as rider_id,
  r.name,
  r.phone,
  r.rating as current_rating,
  r.total_deliveries,
  COALESCE(w.balance_bigint, 0) as wallet_balance,
  COALESCE(SUM(CASE WHEN te.status = 'completed' THEN te.amount_bigint ELSE 0 END), 0) as total_earnings,
  COALESCE(COUNT(DISTINCT t.id), 0) as today_tasks,
  COALESCE(AVG(rr.rating), 0) as average_rating_last_7_days
FROM riders r
LEFT JOIN wallets w ON w.owner_id = r.id AND w.owner_type = 'rider'
LEFT JOIN tasks t ON t.assigned_rider = r.id AND DATE(t.created_at) = CURRENT_DATE
LEFT JOIN rider_earnings te ON te.rider_id = r.id AND te.status = 'completed'
LEFT JOIN rider_ratings rr ON rr.rider_id = r.id AND rr.created_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE r.is_active = true
GROUP BY r.id, r.name, r.phone, r.rating, r.total_deliveries, w.balance_bigint;
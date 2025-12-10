-- migrations/seed_complete.sql
-- Seed data for complete food delivery platform

-- Insert admin
INSERT INTO admins (id, email, name, password_hash, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@mypadifood.com',
  'MypadiFood Admin',
  crypt('AdminPass123!', gen_salt('bf')),
  'superadmin',
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insert demo riders
INSERT INTO riders (id, phone, name, is_active, is_online, vehicle_type, rating, created_at)
VALUES 
  (gen_random_uuid(), '+2348012345001', 'John Rider', true, true, 'motorcycle', 4.8, now()),
  (gen_random_uuid(), '+2348012345002', 'Mike Delivery', true, true, 'bicycle', 4.5, now()),
  (gen_random_uuid(), '+2348012345003', 'Sarah Fast', true, false, 'car', 4.9, now())
ON CONFLICT (phone) DO NOTHING;

-- Insert demo customers
INSERT INTO customers (id, name, email, phone, password_hash, is_verified, created_at)
VALUES 
  (gen_random_uuid(), 'Demo Customer', 'customer@mypadifood.com', '+2348098765001', crypt('CustomerPass123!', gen_salt('bf')), true, now()),
  (gen_random_uuid(), 'Jane Doe', 'jane@example.com', '+2348098765002', crypt('JanePass123!', gen_salt('bf')), true, now()),
  (gen_random_uuid(), 'John Smith', 'john@example.com', '+2348098765003', crypt('JohnPass123!', gen_salt('bf')), true, now())
ON CONFLICT (phone) DO NOTHING;

-- Insert demo vendors
DO $$ 
DECLARE
  vendor1_id uuid;
  vendor2_id uuid;
  vendor3_id uuid;
  admin_id uuid;
BEGIN
  -- Get admin ID
  SELECT id INTO admin_id FROM admins WHERE email = 'admin@mypadifood.com' LIMIT 1;

  -- Vendor 1: Restaurant
  vendor1_id := gen_random_uuid();
  INSERT INTO vendors (id, business_name, description, email, phone, address, password_hash, is_approved, approved_by, created_at)
  VALUES (
    vendor1_id,
    'Tasty Kitchen',
    'Delicious local and continental dishes',
    'tastykitchen@example.com',
    '+2348011111111',
    '{"address_line1": "123 Food Street", "city": "Lagos", "state": "Lagos", "country": "Nigeria"}',
    crypt('VendorPass123!', gen_salt('bf')),
    true,
    admin_id,
    now()
  ) ON CONFLICT (email) DO NOTHING;

  -- Vendor 2: Grocery Store
  vendor2_id := gen_random_uuid();
  INSERT INTO vendors (id, business_name, description, email, phone, address, password_hash, is_approved, approved_by, created_at)
  VALUES (
    vendor2_id,
    'FreshMart Groceries',
    'Fresh vegetables, fruits, and groceries',
    'freshmart@example.com',
    '+2348022222222',
    '{"address_line1": "456 Market Road", "city": "Lagos", "state": "Lagos", "country": "Nigeria"}',
    crypt('VendorPass123!', gen_salt('bf')),
    true,
    admin_id,
    now()
  ) ON CONFLICT (email) DO NOTHING;

  -- Vendor 3: Fast Food
  vendor3_id := gen_random_uuid();
  INSERT INTO vendors (id, business_name, description, email, phone, address, password_hash, is_approved, approved_by, created_at)
  VALUES (
    vendor3_id,
    'Quick Bites',
    'Fast food and snacks',
    'quickbites@example.com',
    '+2348033333333',
    '{"address_line1": "789 Fast Lane", "city": "Lagos", "state": "Lagos", "country": "Nigeria"}',
    crypt('VendorPass123!', gen_salt('bf')),
    true,
    admin_id,
    now()
  ) ON CONFLICT (email) DO NOTHING;

  -- Insert vendor categories
  INSERT INTO vendor_categories (id, vendor_id, category, created_at)
  VALUES 
    (gen_random_uuid(), vendor1_id, 'Restaurant', now()),
    (gen_random_uuid(), vendor1_id, 'Nigerian Cuisine', now()),
    (gen_random_uuid(), vendor2_id, 'Grocery', now()),
    (gen_random_uuid(), vendor2_id, 'Supermarket', now()),
    (gen_random_uuid(), vendor3_id, 'Fast Food', now()),
    (gen_random_uuid(), vendor3_id, 'Snacks', now())
  ON CONFLICT DO NOTHING;

  -- Insert vendor operating hours (open every day 8am-10pm)
  FOR i IN 0..6 LOOP
    INSERT INTO vendor_hours (id, vendor_id, day_of_week, open_time, close_time, created_at)
    VALUES 
      (gen_random_uuid(), vendor1_id, i, '08:00', '22:00', now()),
      (gen_random_uuid(), vendor2_id, i, '08:00', '22:00', now()),
      (gen_random_uuid(), vendor3_id, i, '08:00', '22:00', now())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Insert products for Tasty Kitchen
  INSERT INTO products (id, vendor_id, name, description, price_bigint, category, image_url, preparation_time_minutes, created_at)
  VALUES 
    (gen_random_uuid(), vendor1_id, 'Jollof Rice & Chicken', 'Delicious Nigerian jollof rice with grilled chicken', 250000, 'Main Course', 'https://example.com/jollof.jpg', 25, now()),
    (gen_random_uuid(), vendor1_id, 'Pounded Yam & Egusi Soup', 'Traditional Nigerian meal', 300000, 'Main Course', 'https://example.com/poundedyam.jpg', 30, now()),
    (gen_random_uuid(), vendor1_id, 'Fried Rice & Plantain', 'Special fried rice with fried plantain', 220000, 'Main Course', 'https://example.com/friedrice.jpg', 20, now()),
    (gen_random_uuid(), vendor1_id, 'Chapman', 'Refreshing Nigerian cocktail', 50000, 'Drinks', 'https://example.com/chapman.jpg', 5, now())
  ON CONFLICT DO NOTHING;

  -- Insert products for FreshMart Groceries
  INSERT INTO products (id, vendor_id, name, description, price_bigint, category, image_url, stock_quantity, created_at)
  VALUES 
    (gen_random_uuid(), vendor2_id, 'Fresh Tomatoes', 'Fresh red tomatoes, 1kg', 15000, 'Vegetables', 'https://example.com/tomatoes.jpg', 100, now()),
    (gen_random_uuid(), vendor2_id, 'Bell Peppers', 'Assorted bell peppers, 1kg', 20000, 'Vegetables', 'https://example.com/peppers.jpg', 80, now()),
    (gen_random_uuid(), vendor2_id, 'Onions', 'Fresh onions, 1kg', 12000, 'Vegetables', 'https://example.com/onions.jpg', 120, now()),
    (gen_random_uuid(), vendor2_id, 'Rice', 'Long grain rice, 5kg', 500000, 'Grains', 'https://example.com/rice.jpg', 50, now())
  ON CONFLICT DO NOTHING;

  -- Insert products for Quick Bites
  INSERT INTO products (id, vendor_id, name, description, price_bigint, category, image_url, preparation_time_minutes, created_at)
  VALUES 
    (gen_random_uuid(), vendor3_id, 'Burger & Fries', 'Beef burger with french fries', 180000, 'Fast Food', 'https://example.com/burger.jpg', 15, now()),
    (gen_random_uuid(), vendor3_id, 'Chicken Pizza', '12-inch chicken pizza', 350000, 'Fast Food', 'https://example.com/pizza.jpg', 20, now()),
    (gen_random_uuid(), vendor3_id, 'Chicken Shawarma', 'Spicy chicken shawarma wrap', 120000, 'Fast Food', 'https://example.com/shawarma.jpg', 10, now()),
    (gen_random_uuid(), vendor3_id, 'Soft Drink', 'Coca-Cola, Fanta or Sprite', 30000, 'Drinks', 'https://example.com/soda.jpg', 2, now())
  ON CONFLICT DO NOTHING;

  -- Create wallets for customers
  INSERT INTO wallets (id, owner_id, owner_type, balance_bigint, created_at)
  SELECT gen_random_uuid(), id, 'customer', 5000000, now()
  FROM customers
  ON CONFLICT (owner_id, owner_type) DO NOTHING;

  -- Create wallets for riders
  INSERT INTO wallets (id, owner_id, owner_type, balance_bigint, created_at)
  SELECT gen_random_uuid(), id, 'rider', 1000000, now()
  FROM riders
  ON CONFLICT (owner_id, owner_type) DO NOTHING;

  -- Create wallets for vendors
  INSERT INTO wallets (id, owner_id, owner_type, balance_bigint, created_at)
  VALUES 
    (gen_random_uuid(), vendor1_id, 'vendor', 0, now()),
    (gen_random_uuid(), vendor2_id, 'vendor', 0, now()),
    (gen_random_uuid(), vendor3_id, 'vendor', 0, now())
  ON CONFLICT (owner_id, owner_type) DO NOTHING;

END $$;
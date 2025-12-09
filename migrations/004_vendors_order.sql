-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    address JSONB,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_bigint BIGINT NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id),
    rider_id UUID REFERENCES riders(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount_bigint BIGINT NOT NULL,
    delivery_address JSONB NOT NULL,
    special_instructions TEXT,
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_at_time_bigint BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly plans table
CREATE TABLE weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Weekly plan items table
CREATE TABLE weekly_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID REFERENCES weekly_plans(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
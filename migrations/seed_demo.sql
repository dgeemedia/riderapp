-- seed_demo.sql
INSERT INTO admins (id, email, name, password_hash, role, created_at)
VALUES (
gen_random_uuid(),
'admin@driders.demo',
'D-Riders Demo Admin',
-- password: DemoPass123!
crypt('DemoPass123!', gen_salt('bf')),
'superadmin', now()
) ON CONFLICT (email) DO NOTHING;


-- demo rider
INSERT INTO riders (id, phone, name, is_active, created_at)
VALUES (gen_random_uuid(), '+2348012345678', 'Demo Rider', true, now()) ON CONFLICT (phone) DO NOTHING;


-- demo customer
INSERT INTO customers (id, name, phone, free_credits, created_at)
VALUES (gen_random_uuid(), 'Demo Customer', '+2348098765432', 2, now()) ON CONFLICT (phone) DO NOTHING;
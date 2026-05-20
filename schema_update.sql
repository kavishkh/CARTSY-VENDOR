/* 
  CART$Y Master Reset & Setup 
  This query builds the entire foundation in one go.
*/

-- 0. CLEANUP (Ensures a fresh start with new columns)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PRODUCTS TABLE (Scoped for Vendors & Stock Tracking)
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT DEFAULT 'unisex',
    description TEXT,
    details TEXT[],
    image TEXT NOT NULL,
    images TEXT[],
    vendor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 10, -- Track quantity left in stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE (With Vendor Role)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CART & ORDERS (E-commerce Engine with Dispatch Tracking)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    size TEXT DEFAULT 'default',
    UNIQUE(user_id, product_id, size)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'processing', -- Default start status ('processing', 'shipped', 'delivered')
    shipping_address TEXT,            -- Where order is placed
    full_name TEXT,                   -- Who placed the order
    phone TEXT,                       -- Contact of buyer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_at_time TEXT NOT NULL,
    size TEXT DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENABLE SECURITY (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES: PRODUCTS
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Vendors manage own products" ON products FOR ALL USING (auth.uid() = vendor_id);

-- 6. POLICIES: OTHER
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Customers can view/manage their own orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);
CREATE POLICY "Users insert own order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

-- Vendors can view orders containing their own products
CREATE POLICY "Vendors view own orders" ON orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM order_items
        JOIN products ON products.id = order_items.product_id
        WHERE order_items.order_id = orders.id
        AND products.vendor_id = auth.uid()
    )
);

-- Vendors can update order status for their orders
CREATE POLICY "Vendors update own orders" ON orders FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM order_items
        JOIN products ON products.id = order_items.product_id
        WHERE order_items.order_id = orders.id
        AND products.vendor_id = auth.uid()
    )
);

-- Vendors can view order items corresponding to their products
CREATE POLICY "Vendors view own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM products
        WHERE products.id = order_items.product_id
        AND products.vendor_id = auth.uid()
    )
);

-- 7. AUTOMATIC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. SEED DATA (Base Products for Main Site)
INSERT INTO products (id, name, price, category, image, quantity)
VALUES 
    ('piece-01', 'Architectural Scult', '₹15,000', 'Essentials', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800', 15),
    ('piece-02', 'Minimalist Vessel', '₹8,499', 'Decor', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', 8);

-- 9. STORAGE POLICY CONFIGURATION
-- Clean up old storage policies first to avoid "already exists" errors if re-running
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;

-- This gives your Vendor Website permission to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Product_image');

-- This gives your Main Website permission to show the files to customers
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Product_image');

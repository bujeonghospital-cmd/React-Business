-- Create Product (ผลิตภัณฑ์) table
CREATE TABLE IF NOT EXISTS product_options (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert product options
INSERT INTO product_options (product_name) VALUES
    ('ตัดถุงใต้ตา'),
    ('Sub brow lift'),
    ('แก้กล้ามเนื้อตาอ่อนแรง'),
    ('ตาสองชั้น'),
    ('เสริมจมูก'),
    ('แก้จมูก'),
    ('เสริมคาง'),
    ('ดึงหน้า'),
    ('Skin'),
    ('ต้อ'),
    ('ดูดไขมัน'),
    ('เสริมหน้าอก'),
    ('Foxyeye'),
    ('ปากกระจับ'),
    ('Direct Brow Lift')
ON CONFLICT (product_name) DO NOTHING;

-- Add product_id column to customers table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN product_id INTEGER REFERENCES product_options(id);
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_product_id ON customers(product_id);

-- View to see product statistics
CREATE OR REPLACE VIEW product_statistics AS
SELECT 
    po.id,
    po.product_name,
    COUNT(c.id) as customer_count
FROM product_options po
LEFT JOIN customers c ON c.product_id = po.id
GROUP BY po.id, po.product_name
ORDER BY customer_count DESC;

-- Query to see all products
-- SELECT * FROM product_options;

-- Query to see product statistics
-- SELECT * FROM product_statistics;

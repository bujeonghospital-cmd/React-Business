-- Create Country (ประเทศ) table
CREATE TABLE IF NOT EXISTS country_options (
    id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert country options
INSERT INTO country_options (country_name) VALUES
    ('ไทย'),
    ('ลาว'),
    ('จีน'),
    ('อินโด'),
    ('ฟิลิปินส์'),
    ('สิงคโปร์'),
    ('ปากี'),
    ('อิรัก'),
    ('เกาหลี'),
    ('อิสราเอล'),
    ('กัมพูชา')
ON CONFLICT (country_name) DO NOTHING;

-- Add country_id column to customers table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'country_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN country_id INTEGER REFERENCES country_options(id);
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_country_id ON customers(country_id);

-- View to see country statistics
CREATE OR REPLACE VIEW country_statistics AS
SELECT 
    co.id,
    co.country_name,
    COUNT(c.id) as customer_count
FROM country_options co
LEFT JOIN customers c ON c.country_id = co.id
GROUP BY co.id, co.country_name
ORDER BY customer_count DESC;

-- Query to see all countries
-- SELECT * FROM country_options;

-- Query to see country statistics
-- SELECT * FROM country_statistics;

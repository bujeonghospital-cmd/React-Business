-- Create Source (แหล่งที่มา) table
CREATE TABLE IF NOT EXISTS source_options (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert source options
INSERT INTO source_options (source_name) VALUES
    ('Facebook'),
    ('TikTok'),
    ('Google (Web)'),
    ('Call In'),
    ('Offline'),
    ('Walk-in'),
    ('Line OA')
ON CONFLICT (source_name) DO NOTHING;

-- Add source_id column to customers table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'source_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN source_id INTEGER REFERENCES source_options(id);
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_source_id ON customers(source_id);

-- View to see source statistics
CREATE OR REPLACE VIEW source_statistics AS
SELECT 
    so.id,
    so.source_name,
    COUNT(c.id) as customer_count
FROM source_options so
LEFT JOIN customers c ON c.source_id = so.id
GROUP BY so.id, so.source_name
ORDER BY customer_count DESC;

-- Query to see all sources
-- SELECT * FROM source_options;

-- Query to see source statistics
-- SELECT * FROM source_statistics;

-- Create table for table size options
CREATE TABLE IF NOT EXISTS table_size_options (
  id SERIAL PRIMARY KEY,
  size_value INTEGER NOT NULL,
  size_label VARCHAR(50) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default table size options
INSERT INTO table_size_options (size_value, size_label, sort_order, is_active) VALUES
(100, '100 px', 1, true),
(200, '200 px', 2, true),
(300, '300 px', 3, true),
(400, '400 px', 4, true),
(500, '500 px', 5, true),
(600, '600 px', 6, true),
(700, '700 px', 7, true),
(800, '800 px', 8, true),
(900, '900 px', 9, true),
(1000, '1000 px', 10, true)
ON CONFLICT DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_table_size_options_active ON table_size_options(is_active);
CREATE INDEX IF NOT EXISTS idx_table_size_options_sort ON table_size_options(sort_order);

-- Add comment to table
COMMENT ON TABLE table_size_options IS 'Table to store table size options for customer data table';
COMMENT ON COLUMN table_size_options.size_value IS 'Size value in pixels';
COMMENT ON COLUMN table_size_options.size_label IS 'Display label for the size option';
COMMENT ON COLUMN table_size_options.sort_order IS 'Order in which options should be displayed';
COMMENT ON COLUMN table_size_options.is_active IS 'Whether this option is active/visible';

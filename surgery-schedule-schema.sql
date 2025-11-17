-- =====================================================
-- Surgery Schedule Database Schema
-- ตารางสำหรับเก็บข้อมูลตารางนัดผ่าตัด (แทนที่ Google Sheets "Film data")
-- =====================================================

-- ตาราง surgery_schedule (ข้อมูลนัดผ่าตัด)
CREATE TABLE IF NOT EXISTS surgery_schedule (
  id BIGSERIAL PRIMARY KEY,
  
  -- ข้อมูลพื้นฐาน (จาก Google Sheets columns)
  doctor TEXT,                          -- คอลัมน์ B: หมอ
  contact_person TEXT,                  -- คอลัมน์ E: ผู้ติดต่อ (จีน, มุก, เจ, ว่าน)
  customer_name TEXT,                   -- คอลัมน์ F: ชื่อ
  phone TEXT,                           -- คอลัมน์ G: เบอร์โทร
  
  -- วันที่และเวลา
  date_surgery_scheduled DATE,          -- คอลัมน์ P: วันที่ได้นัดผ่าตัด (P table)
  appointment_time TEXT,                -- คอลัมน์ M: เวลาที่นัด
  surgery_date DATE,                    -- คอลัมน์ L: วันที่ผ่าตัด (L table)
  date_consult_scheduled DATE,          -- คอลัมน์อื่นๆ ที่อาจมี: วันที่ได้นัด consult
  
  -- ข้อมูลทางการเงิน
  proposed_amount NUMERIC(12, 2),       -- คอลัมน์ Q: ยอดนำเสนอ (Revenue)
  
  -- ข้อมูลเพิ่มเติม
  status TEXT,                          -- สถานะ
  notes TEXT,                           -- หมายเหตุ
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Tracking
  data_source TEXT DEFAULT 'database'  -- ระบุแหล่งที่มาของข้อมูล
);

-- สร้าง indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_surgery_contact_person ON surgery_schedule(contact_person);
CREATE INDEX IF NOT EXISTS idx_surgery_scheduled_date ON surgery_schedule(date_surgery_scheduled);
CREATE INDEX IF NOT EXISTS idx_surgery_actual_date ON surgery_schedule(surgery_date);
CREATE INDEX IF NOT EXISTS idx_surgery_phone ON surgery_schedule(phone);
CREATE INDEX IF NOT EXISTS idx_surgery_doctor ON surgery_schedule(doctor);

-- Composite index สำหรับ query ที่ใช้บ่อย (filter by contact_person and date)
CREATE INDEX IF NOT EXISTS idx_surgery_person_scheduled_date 
  ON surgery_schedule(contact_person, date_surgery_scheduled);
CREATE INDEX IF NOT EXISTS idx_surgery_person_actual_date 
  ON surgery_schedule(contact_person, surgery_date);

-- =====================================================
-- N_SaleIncentive Table (ข้อมูลรายรับจริง)
-- =====================================================

CREATE TABLE IF NOT EXISTS sale_incentive (
  id BIGSERIAL PRIMARY KEY,
  
  -- ข้อมูลพื้นฐาน
  sale_person TEXT NOT NULL,           -- ชื่อพนักงานขาย (จีน, มุก, เจ, ว่าน)
  sale_date DATE NOT NULL,             -- วันที่บันทึกยอดขาย
  income NUMERIC(12, 2) NOT NULL,      -- รายรับ (บาท)
  
  -- ข้อมูลเพิ่มเติม
  day INTEGER,                         -- วันที่ (1-31) extracted from sale_date
  month INTEGER,                       -- เดือน (1-12) extracted from sale_date
  year INTEGER,                        -- ปี extracted from sale_date
  
  -- ข้อมูลอ้างอิง
  customer_name TEXT,                  -- ชื่อลูกค้า (ถ้ามี)
  notes TEXT,                          -- หมายเหตุ
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Tracking
  data_source TEXT DEFAULT 'database'  -- ระบุแหล่งที่มาของข้อมูล
);

-- สร้าง indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_sale_person ON sale_incentive(sale_person);
CREATE INDEX IF NOT EXISTS idx_sale_date ON sale_incentive(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_year_month ON sale_incentive(year, month);

-- Composite index สำหรับ query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_sale_person_date 
  ON sale_incentive(sale_person, sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_person_year_month 
  ON sale_incentive(sale_person, year, month);

-- =====================================================
-- Triggers สำหรับ auto-update
-- =====================================================

-- Trigger สำหรับ update updated_at ใน surgery_schedule
CREATE OR REPLACE FUNCTION update_surgery_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_surgery_schedule_updated_at 
  BEFORE UPDATE ON surgery_schedule
  FOR EACH ROW 
  EXECUTE FUNCTION update_surgery_schedule_updated_at();

-- Trigger สำหรับ update updated_at ใน sale_incentive
CREATE OR REPLACE FUNCTION update_sale_incentive_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_sale_incentive_updated_at 
  BEFORE UPDATE ON sale_incentive
  FOR EACH ROW 
  EXECUTE FUNCTION update_sale_incentive_updated_at();

-- Trigger สำหรับ auto-populate day, month, year ใน sale_incentive
CREATE OR REPLACE FUNCTION extract_date_parts_sale_incentive()
RETURNS TRIGGER AS $$
BEGIN
    NEW.day = EXTRACT(DAY FROM NEW.sale_date);
    NEW.month = EXTRACT(MONTH FROM NEW.sale_date);
    NEW.year = EXTRACT(YEAR FROM NEW.sale_date);
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_extract_date_parts_sale_incentive 
  BEFORE INSERT OR UPDATE ON sale_incentive
  FOR EACH ROW 
  EXECUTE FUNCTION extract_date_parts_sale_incentive();

-- =====================================================
-- ตัวอย่างข้อมูลทดสอบ (ถ้าต้องการ)
-- =====================================================

-- ตัวอย่าง surgery_schedule
-- INSERT INTO surgery_schedule 
-- (doctor, contact_person, customer_name, phone, date_surgery_scheduled, appointment_time, surgery_date, proposed_amount)
-- VALUES 
-- ('นพ.ทดสอบ', 'จีน', 'ลูกค้าทดสอบ 1', '0812345678', '2024-12-01', '10:00', '2024-12-15', 50000),
-- ('นพ.ทดสอบ', 'มุก', 'ลูกค้าทดสอบ 2', '0823456789', '2024-12-02', '11:00', '2024-12-16', 75000),
-- ('นพ.ทดสอบ', 'เจ', 'ลูกค้าทดสอบ 3', '0834567890', '2024-12-03', '14:00', '2024-12-17', 60000);

-- ตัวอย่าง sale_incentive
-- INSERT INTO sale_incentive 
-- (sale_person, sale_date, income, customer_name)
-- VALUES 
-- ('จีน', '2024-12-01', 50000, 'ลูกค้าทดสอบ 1'),
-- ('มุก', '2024-12-02', 75000, 'ลูกค้าทดสอบ 2'),
-- ('เจ', '2024-12-03', 60000, 'ลูกค้าทดสอบ 3');

-- =====================================================
-- Views สำหรับ reporting (optional)
-- =====================================================

-- View: รวมยอดรายรับรายวัน
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT 
  sale_person,
  sale_date,
  SUM(income) as total_income,
  COUNT(*) as transaction_count
FROM sale_incentive
GROUP BY sale_person, sale_date
ORDER BY sale_date DESC, sale_person;

-- View: รวมยอดรายรับรายเดือน
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT 
  sale_person,
  year,
  month,
  SUM(income) as total_income,
  COUNT(*) as transaction_count,
  AVG(income) as avg_income
FROM sale_incentive
GROUP BY sale_person, year, month
ORDER BY year DESC, month DESC, sale_person;

-- View: สรุปจำนวนนัดผ่าตัดรายเดือน
CREATE OR REPLACE VIEW monthly_surgery_count AS
SELECT 
  contact_person,
  EXTRACT(YEAR FROM date_surgery_scheduled) as year,
  EXTRACT(MONTH FROM date_surgery_scheduled) as month,
  COUNT(*) as scheduled_count
FROM surgery_schedule
WHERE date_surgery_scheduled IS NOT NULL
GROUP BY contact_person, year, month
ORDER BY year DESC, month DESC, contact_person;

-- View: สรุปจำนวนผ่าตัดจริงรายเดือน
CREATE OR REPLACE VIEW monthly_actual_surgery_count AS
SELECT 
  contact_person,
  EXTRACT(YEAR FROM surgery_date) as year,
  EXTRACT(MONTH FROM surgery_date) as month,
  COUNT(*) as actual_count
FROM surgery_schedule
WHERE surgery_date IS NOT NULL
GROUP BY contact_person, year, month
ORDER BY year DESC, month DESC, contact_person;

COMMENT ON TABLE surgery_schedule IS 'ตารางเก็บข้อมูลนัดผ่าตัด (แทนที่ Google Sheets Film data)';
COMMENT ON TABLE sale_incentive IS 'ตารางเก็บข้อมูลรายรับจริง (แทนที่ Google Sheets N_SaleIncentive)';
COMMENT ON VIEW daily_revenue_summary IS 'สรุปรายรับรายวันของแต่ละคน';
COMMENT ON VIEW monthly_revenue_summary IS 'สรุปรายรับรายเดือนของแต่ละคน';
COMMENT ON VIEW monthly_surgery_count IS 'สรุปจำนวนนัดผ่าตัดรายเดือน (P table)';
COMMENT ON VIEW monthly_actual_surgery_count IS 'สรุปจำนวนผ่าตัดจริงรายเดือน (L table)';

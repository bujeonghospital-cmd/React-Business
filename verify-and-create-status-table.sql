-- ตรวจสอบว่าตาราง status_options มีอยู่หรือไม่ และสร้างใหม่ถ้ายังไม่มี
-- รองรับทั้ง schema "BJH-Server" และ public

-- ตรวจสอบ schema ที่มีอยู่
SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('BJH-Server', 'public');

-- ตรวจสอบตารางที่มีอยู่
SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'status_options';

-- สร้างตารางใน schema "BJH-Server" (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS "BJH-Server".status_options (
    id SERIAL PRIMARY KEY,
    value VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_status_value ON "BJH-Server".status_options(value);
CREATE INDEX IF NOT EXISTS idx_status_active ON "BJH-Server".status_options(is_active);

-- เพิ่มข้อมูล (ถ้ายังไม่มี)
INSERT INTO "BJH-Server".status_options (value, label, color, display_order) 
VALUES
('all', 'ทั้งหมด', 'bg-gray-200 text-gray-800', 1),
('ซื้อแล้ว รอนัดหมาย (Online)', 'ซื้อแล้ว รอนัดหมาย (Online)', 'bg-green-500 text-black', 2),
('นัดแล้ว', 'นัดแล้ว', 'bg-white text-gray-900 border border-gray-300', 3),
('เป็นลูกค้าแล้ว', 'เป็นลูกค้าแล้ว', 'bg-blue-900 text-black', 4),
('Consult แล้วรอตัดสินใจ', 'Consult แล้วรอตัดสินใจ', 'bg-purple-500 text-black', 5),
('ยกเลิกนัด', 'ยกเลิกนัด', 'bg-gray-500 text-black', 6),
('เลื่อน นัดรอนัดใหม่', 'เลื่อน นัดรอนัดใหม่', 'bg-blue-600 text-black', 7),
('โอนราคาแล้ว', 'โอนราคาแล้ว', 'bg-purple-400 text-black', 8),
('ติดตาม', 'ติดตาม', 'bg-red-500 text-black', 9),
('สนใจ รอนัดหมาย (Online)', 'สนใจ รอนัดหมาย (Online)', 'bg-yellow-500 text-black', 10),
('ไม่สนใจ', 'ไม่สนใจ', 'bg-orange-500 text-black', 11),
('สนใจ รอนัดหมาย', 'สนใจ รอนัดหมาย', 'bg-teal-500 text-black', 12),
('นัด Consult', 'นัด Consult', 'bg-indigo-500 text-black', 13),
('นัดพร้อมทำ', 'นัดพร้อมทำ', 'bg-gray-400 text-black', 14),
('Consultแล้วรอทำ', 'Consultแล้วรอทำ', 'bg-gray-500 text-black', 15),
('ลูกค้าติดปัญหา', 'ลูกค้าติดปัญหา', 'bg-gray-400 text-black', 16),
('นัด Consult (VDO)', 'นัด Consult (VDO)', 'bg-gray-500 text-black', 17),
('เบอร์ติดต่อไม่ได้', 'เบอร์ติดต่อไม่ได้', 'bg-gray-400 text-black', 18)
ON CONFLICT (value) DO NOTHING;

-- ตรวจสอบข้อมูลที่เพิ่มเข้าไป
SELECT COUNT(*) as total_rows FROM "BJH-Server".status_options;
SELECT * FROM "BJH-Server".status_options ORDER BY display_order LIMIT 5;

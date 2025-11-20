-- สร้างตาราง status_options สำหรับเก็บข้อมูลสถานะ
CREATE TABLE IF NOT EXISTS status_options (
    id SERIAL PRIMARY KEY,
    value VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX idx_status_value ON status_options(value);
CREATE INDEX idx_status_active ON status_options(is_active);

-- เพิ่มข้อมูล status options
INSERT INTO status_options (value, label, color, display_order) VALUES
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
('เบอร์ติดต่อไม่ได้', 'เบอร์ติดต่อไม่ได้', 'bg-gray-400 text-black', 18);

-- Query สำหรับดึงข้อมูลสถานะทั้งหมดที่ active
-- SELECT * FROM status_options WHERE is_active = true ORDER BY display_order;

-- Query สำหรับดึงข้อมูลในรูปแบบ JSON (สำหรับใช้กับ API)
-- SELECT json_agg(
--     json_build_object(
--         'value', value,
--         'label', label,
--         'color', color
--     ) ORDER BY display_order
-- ) as status_options
-- FROM status_options
-- WHERE is_active = true;

-- Query สำหรับอัพเดทสถานะ
-- UPDATE status_options SET color = 'bg-green-600 text-white' WHERE value = 'นัดแล้ว';

-- Query สำหรับเพิ่มสถานะใหม่
-- INSERT INTO status_options (value, label, color, display_order) 
-- VALUES ('สถานะใหม่', 'สถานะใหม่', 'bg-gray-300 text-black', 19);

-- Query สำหรับลบสถานะ (Soft Delete)
-- UPDATE status_options SET is_active = false WHERE value = 'สถานะที่ต้องการลบ';

-- Query สำหรับจัดเรียงลำดับใหม่
-- UPDATE status_options SET display_order = 1 WHERE value = 'เป็นลูกค้าแล้ว';

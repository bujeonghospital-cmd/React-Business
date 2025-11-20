-- คำสั่ง SQL สำหรับเพิ่มตาราง status_options อื่นๆ (ถ้ายังไม่มี)

-- สำหรับ productOptions
CREATE TABLE IF NOT EXISTS "BJH-Server".product_options (
    id SERIAL PRIMARY KEY,
    value VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_value ON "BJH-Server".product_options(value);
CREATE INDEX idx_product_active ON "BJH-Server".product_options(is_active);

INSERT INTO "BJH-Server".product_options (value, label, display_order) VALUES
('all', 'ทั้งหมด', 1),
('ตีตัวไล่ตัว', 'ตีตัวไล่ตัว', 2),
('Sub brow lift', 'Sub brow lift', 3),
('แก้ตาหมื่อตอนและแก้ว', 'แก้ตาหมื่อตอนและแก้ว', 4),
('ตาสองชั้น', 'ตาสองชั้น', 5),
('เสริมจมูก', 'เสริมจมูก', 6),
('แก้จมูก', 'แก้จมูก', 7),
('เสร็จตาขาว', 'เสร็จตาขาว', 8),
('ลิงหน้า', 'ลิงหน้า', 9),
('Skin', 'Skin', 10),
('ตื่อ', 'ตื่อ', 11)
ON CONFLICT (value) DO NOTHING;

-- สำหรับ contactOptions
CREATE TABLE IF NOT EXISTS "BJH-Server".contact_options (
    id SERIAL PRIMARY KEY,
    value VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_value ON "BJH-Server".contact_options(value);
CREATE INDEX idx_contact_active ON "BJH-Server".contact_options(is_active);

INSERT INTO "BJH-Server".contact_options (value, label, display_order) VALUES
('all', 'ทั้งหมด', 1),
('สา', 'สา', 2),
('เจ', 'เจ', 3),
('พิดยา', 'พิดยา', 4),
('ว่าน', 'ว่าน', 5),
('จีน', 'จีน', 6),
('มุก', 'มุก', 7),
('ตั้งโอ๋', 'ตั้งโอ๋', 8)
ON CONFLICT (value) DO NOTHING;

-- Query ตัวอย่างสำหรับดึงข้อมูล
-- SELECT * FROM "BJH-Server".status_options WHERE is_active = true ORDER BY display_order;
-- SELECT * FROM "BJH-Server".product_options WHERE is_active = true ORDER BY display_order;
-- SELECT * FROM "BJH-Server".contact_options WHERE is_active = true ORDER BY display_order;

-- =====================================================
-- SQL สำหรับเก็บข้อมูล Video และ Image (Base64)
-- สำหรับ All Files Gallery
-- =====================================================

-- ลบ table เก่า (ถ้ามี)
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS media_tags CASCADE;
DROP TABLE IF EXISTS media_categories CASCADE;

-- =====================================================
-- 1. สร้าง Table สำหรับเก็บหมวดหมู่
-- =====================================================
CREATE TABLE media_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. สร้าง Table หลักสำหรับเก็บไฟล์ Media
-- =====================================================
CREATE TABLE media_files (
    id SERIAL PRIMARY KEY,
    
    -- ข้อมูลพื้นฐาน
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- ประเภทไฟล์: 'image', 'video', 'clip'
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video', 'clip')),
    
    -- URL ของไฟล์ต้นฉบับ (ถ้าเก็บไว้ใน Storage เช่น S3, Cloudinary)
    file_url TEXT,
    
    -- Base64 ของ Thumbnail (สำหรับแสดง Preview)
    -- เก็บเป็น TEXT เพราะ Base64 จะมีขนาดใหญ่
    thumbnail_base64 TEXT,
    
    -- Base64 ของไฟล์เต็ม (Optional - ใช้สำหรับไฟล์ขนาดเล็ก)
    -- สำหรับวิดีโอขนาดใหญ่ ควรเก็บ URL แทน
    file_base64 TEXT,
    
    -- ข้อมูล MIME Type
    mime_type VARCHAR(100),
    
    -- ขนาดไฟล์ (เป็น bytes)
    file_size BIGINT,
    
    -- ขนาดไฟล์แสดงผล (เช่น "2.4 MB")
    file_size_display VARCHAR(50),
    
    -- ความยาววิดีโอ (สำหรับ video/clip)
    duration VARCHAR(20),
    duration_seconds INTEGER,
    
    -- ความละเอียด
    width INTEGER,
    height INTEGER,
    
    -- หมวดหมู่
    category_id INTEGER REFERENCES media_categories(id),
    category_name VARCHAR(100),
    
    -- สถานะ
    is_favorite BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- สถิติ
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- ข้อมูลผู้อัพโหลด
    uploaded_by INTEGER,
    uploaded_by_name VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index สำหรับค้นหา
    search_vector TSVECTOR
);

-- =====================================================
-- 3. สร้าง Table สำหรับเก็บ Tags
-- =====================================================
CREATE TABLE media_tags (
    id SERIAL PRIMARY KEY,
    media_id INTEGER REFERENCES media_files(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(media_id, tag_name)
);

-- =====================================================
-- 4. สร้าง Indexes สำหรับ Performance
-- =====================================================

-- Index สำหรับค้นหาตามประเภท
CREATE INDEX idx_media_files_type ON media_files(file_type);

-- Index สำหรับค้นหาตามหมวดหมู่
CREATE INDEX idx_media_files_category ON media_files(category_id);
CREATE INDEX idx_media_files_category_name ON media_files(category_name);

-- Index สำหรับค้นหารายการโปรด
CREATE INDEX idx_media_files_favorite ON media_files(is_favorite) WHERE is_favorite = TRUE;

-- Index สำหรับค้นหาตามวันที่
CREATE INDEX idx_media_files_created ON media_files(created_at DESC);

-- Index สำหรับค้นหาตามยอดวิว
CREATE INDEX idx_media_files_views ON media_files(view_count DESC);

-- Index สำหรับ Full-text Search
CREATE INDEX idx_media_files_search ON media_files USING GIN(search_vector);

-- Index สำหรับ Tags
CREATE INDEX idx_media_tags_name ON media_tags(tag_name);
CREATE INDEX idx_media_tags_media ON media_tags(media_id);

-- =====================================================
-- 5. สร้าง Function สำหรับ Update Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง Trigger
CREATE TRIGGER trigger_update_media_timestamp
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_media_timestamp();

-- =====================================================
-- 6. สร้าง Function สำหรับ Update Search Vector
-- =====================================================
CREATE OR REPLACE FUNCTION update_media_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('simple', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.category_name, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง Trigger
CREATE TRIGGER trigger_update_media_search
    BEFORE INSERT OR UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_media_search_vector();

-- =====================================================
-- 7. ใส่ข้อมูลหมวดหมู่เริ่มต้น
-- =====================================================
INSERT INTO media_categories (name, description) VALUES
    ('Before/After', 'รูปภาพก่อน-หลัง'),
    ('Surgery Videos', 'วิดีโอการผ่าตัด'),
    ('Promo Clips', 'คลิปโปรโมท'),
    ('Consultations', 'การให้คำปรึกษา'),
    ('Training', 'วิดีโอฝึกอบรม'),
    ('Social Media', 'คอนเทนต์ Social Media'),
    ('Marketing', 'สื่อการตลาด'),
    ('Testimonials', 'รีวิวจากลูกค้า'),
    ('Products', 'รูปภาพสินค้า'),
    ('Events', 'งานอีเวนต์');

-- =====================================================
-- 8. ตัวอย่างการ Insert ข้อมูล
-- =====================================================

-- ตัวอย่าง Insert รูปภาพ พร้อม Base64
-- หมายเหตุ: Base64 ที่แท้จริงจะยาวมาก นี่เป็นแค่ตัวอย่าง
INSERT INTO media_files (
    name,
    description,
    file_type,
    file_url,
    thumbnail_base64,
    mime_type,
    file_size,
    file_size_display,
    category_name,
    is_favorite,
    view_count,
    uploaded_by_name
) VALUES (
    'Before-After-001.jpg',
    'รูปก่อน-หลังทำหน้า',
    'image',
    '/images/before-after-001.jpg',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...', -- ใส่ Base64 จริงตรงนี้
    'image/jpeg',
    2516582,
    '2.4 MB',
    'Before/After',
    TRUE,
    1250,
    'Admin'
);

-- ตัวอย่าง Insert วิดีโอ
INSERT INTO media_files (
    name,
    description,
    file_type,
    file_url,
    thumbnail_base64,
    mime_type,
    file_size,
    file_size_display,
    duration,
    duration_seconds,
    width,
    height,
    category_name,
    is_favorite,
    view_count,
    uploaded_by_name
) VALUES (
    'Surgery-Video-001.mp4',
    'วิดีโอการผ่าตัดแบบ Training',
    'video',
    '/videos/surgery-001.mp4',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...', -- Thumbnail เป็น Base64
    'video/mp4',
    48023142,
    '45.8 MB',
    '12:45',
    765,
    1920,
    1080,
    'Surgery Videos',
    FALSE,
    890,
    'Admin'
);

-- ตัวอย่าง Insert คลิป
INSERT INTO media_files (
    name,
    description,
    file_type,
    file_url,
    thumbnail_base64,
    mime_type,
    file_size,
    file_size_display,
    duration,
    duration_seconds,
    category_name,
    is_favorite,
    view_count,
    uploaded_by_name
) VALUES (
    'Promo-Clip-001.mp4',
    'คลิปโปรโมทสำหรับ Social Media',
    'clip',
    '/clips/promo-001.mp4',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...', -- Thumbnail เป็น Base64
    'video/mp4',
    15938355,
    '15.2 MB',
    '00:45',
    45,
    'Promo Clips',
    TRUE,
    2340,
    'Admin'
);

-- ใส่ Tags สำหรับไฟล์
INSERT INTO media_tags (media_id, tag_name) VALUES
    (1, 'Before/After'),
    (1, 'Face'),
    (2, 'Surgery'),
    (2, 'Training'),
    (3, 'Promotion'),
    (3, 'Social');

-- =====================================================
-- 9. Useful Queries
-- =====================================================

-- ดึงข้อมูลทั้งหมด พร้อม Tags
-- SELECT 
--     m.*,
--     ARRAY_AGG(t.tag_name) as tags
-- FROM media_files m
-- LEFT JOIN media_tags t ON m.id = t.media_id
-- WHERE m.is_active = TRUE
-- GROUP BY m.id
-- ORDER BY m.created_at DESC;

-- ค้นหาตามประเภท
-- SELECT * FROM media_files WHERE file_type = 'image' AND is_active = TRUE;

-- ค้นหารายการโปรด
-- SELECT * FROM media_files WHERE is_favorite = TRUE AND is_active = TRUE;

-- ค้นหาด้วย Full-text Search
-- SELECT * FROM media_files 
-- WHERE search_vector @@ to_tsquery('simple', 'surgery');

-- อัพเดทยอดวิว
-- UPDATE media_files SET view_count = view_count + 1 WHERE id = 1;

-- =====================================================
-- 10. View สำหรับดึงข้อมูลพร้อม Tags
-- =====================================================
CREATE OR REPLACE VIEW v_media_files_with_tags AS
SELECT 
    m.id,
    m.name,
    m.description,
    m.file_type,
    m.file_url,
    m.thumbnail_base64,
    m.mime_type,
    m.file_size,
    m.file_size_display,
    m.duration,
    m.duration_seconds,
    m.width,
    m.height,
    m.category_id,
    m.category_name,
    m.is_favorite,
    m.is_active,
    m.is_public,
    m.view_count,
    m.download_count,
    m.like_count,
    m.uploaded_by,
    m.uploaded_by_name,
    m.created_at,
    m.updated_at,
    COALESCE(ARRAY_AGG(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), ARRAY[]::VARCHAR[]) as tags
FROM media_files m
LEFT JOIN media_tags t ON m.id = t.media_id
GROUP BY m.id;

-- =====================================================
-- สรุปโครงสร้าง Table
-- =====================================================
-- media_categories: เก็บหมวดหมู่
-- media_files: เก็บข้อมูลไฟล์หลัก (รวม Base64)
-- media_tags: เก็บ Tags ของแต่ละไฟล์
-- v_media_files_with_tags: View สำหรับดึงข้อมูลพร้อม Tags

-- หมายเหตุสำคัญ:
-- 1. Base64 ของ Thumbnail ควรมีขนาดไม่เกิน 100KB (ย่อขนาดก่อน)
-- 2. สำหรับวิดีโอขนาดใหญ่ ควรเก็บ URL และใช้ Cloud Storage
-- 3. file_base64 สำหรับไฟล์เต็ม ใช้เฉพาะไฟล์ขนาดเล็กเท่านั้น

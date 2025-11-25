-- สร้างตาราง hr_employees สำหรับจัดการข้อมูลพนักงาน
CREATE TABLE IF NOT EXISTS hr_employees (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR(100) NOT NULL,
  role            VARCHAR(50),
  yearly_leave_quota INT NOT NULL DEFAULT 10,  -- วันลาต่อปี
  leave_remaining   INT NOT NULL DEFAULT 10,   -- วันลาคงเหลือ (อัปเดตเวลาอนุมัติลา)
  work_start_time TIME,  -- เวลาเข้างานปกติ (เช่น '08:00')
  work_end_time   TIME,  -- เวลาเลิกงานปกติ (เช่น '19:00')
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX IF NOT EXISTS idx_hr_employees_active ON hr_employees(is_active);
CREATE INDEX IF NOT EXISTS idx_hr_employees_role ON hr_employees(role);

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO hr_employees (full_name, role, yearly_leave_quota, leave_remaining, work_start_time, work_end_time, is_active) VALUES
('สมชาย ใจดี', 'พนักงานขาย', 12, 12, '08:00', '17:00', true),
('สมหญิง รักงาน', 'ผู้จัดการ', 15, 15, '08:30', '18:30', true),
('ประยุทธ์ มานะ', 'ช่างเทคนิค', 10, 10, '09:00', '18:00', true);

-- แสดงข้อมูลทั้งหมด
SELECT * FROM hr_employees;

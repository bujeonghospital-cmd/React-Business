-- สร้างตาราง hr_attendance สำหรับบันทึกการเข้างานของพนักงาน
CREATE TABLE IF NOT EXISTS hr_attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  time_in TIME,
  time_out TIME,
  status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
  work_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- สร้าง indexes เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_hr_attendance_employee ON hr_attendance(employee_id);
CREATE INDEX idx_hr_attendance_date ON hr_attendance(work_date);
CREATE INDEX idx_hr_attendance_status ON hr_attendance(status);

-- สร้าง unique constraint เพื่อป้องกันการบันทึกซ้ำในวันเดียวกัน
CREATE UNIQUE INDEX idx_hr_attendance_unique ON hr_attendance(employee_id, work_date);

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO hr_attendance (employee_id, work_date, time_in, time_out, status, work_hours, overtime_hours, note) VALUES
(1, '2024-01-15', '09:00:00', '18:00:00', 'PRESENT', 8.00, 0.00, 'ทำงานปกติ'),
(1, '2024-01-16', '09:15:00', '18:00:00', 'LATE', 7.75, 0.00, 'สายเล็กน้อย'),
(2, '2024-01-15', '08:30:00', '19:00:00', 'PRESENT', 9.50, 1.50, 'ทำงานล่วงเวลา'),
(2, '2024-01-16', NULL, NULL, 'LEAVE', 0.00, 0.00, 'ลาป่วย'),
(3, '2024-01-15', NULL, NULL, 'WFH', 8.00, 0.00, 'Work from home');

COMMENT ON TABLE hr_attendance IS 'บันทึกการเข้างาน-ออกงานของพนักงาน';
COMMENT ON COLUMN hr_attendance.status IS 'สถานะการทำงาน: PRESENT, LATE, LEAVE, ABSENT, WFH';

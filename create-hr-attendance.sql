-- สร้างตาราง hr_attendance ใน schema BJH-Server
CREATE TABLE IF NOT EXISTS "BJH-Server".hr_attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  work_date DATE NOT NULL,
  time_in TIME,
  time_out TIME,
  status VARCHAR(20) DEFAULT 'PRESENT',
  work_hours DECIMAL(4,2) DEFAULT 0,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_attendance 
    UNIQUE (employee_id, work_date)
);

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON "BJH-Server".hr_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON "BJH-Server".hr_attendance(work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON "BJH-Server".hr_attendance(status);

-- Comment
COMMENT ON TABLE "BJH-Server".hr_attendance IS 'ตารางบันทึกการเข้างานของพนักงาน';
COMMENT ON COLUMN "BJH-Server".hr_attendance.employee_id IS 'รหัสพนักงาน (FK to user)';
COMMENT ON COLUMN "BJH-Server".hr_attendance.work_date IS 'วันที่ทำงาน';
COMMENT ON COLUMN "BJH-Server".hr_attendance.time_in IS 'เวลาเข้างาน';
COMMENT ON COLUMN "BJH-Server".hr_attendance.time_out IS 'เวลาออกงาน';
COMMENT ON COLUMN "BJH-Server".hr_attendance.status IS 'สถานะการเข้างาน (PRESENT, LATE, LEAVE, ABSENT, WFH)';
COMMENT ON COLUMN "BJH-Server".hr_attendance.work_hours IS 'ชั่วโมงทำงาน';
COMMENT ON COLUMN "BJH-Server".hr_attendance.overtime_hours IS 'ชั่วโมง OT';
COMMENT ON COLUMN "BJH-Server".hr_attendance.note IS 'หมายเหตุ';

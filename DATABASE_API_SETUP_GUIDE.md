# DATABASE API SETUP GUIDE

## คู่มือการตั้งค่า Database API สำหรับ Surgery Schedule และ Sale Incentive

เอกสารนี้อธิบายวิธีการตั้งค่า API เชื่อมกับ PostgreSQL Database เพื่อแทนที่ Python API ที่ใช้ดึงข้อมูลจาก Google Sheets

---

## 📋 สิ่งที่เปลี่ยนแปลง

### ก่อนหน้า (Python API)

- ดึงข้อมูลจาก Google Sheets ผ่าน Python API บน Railway
- ต้องพึ่งพา Python API และ Google Sheets API
- ข้อมูลอยู่บน Google Sheets "Film data" และ "N_SaleIncentive"

### ตอนนี้ (Database API)

- ดึงข้อมูลจาก PostgreSQL Database โดยตรง
- ไม่ต้องพึ่งพา Python API หรือ Google Sheets API
- ข้อมูลอยู่ในตาราง `surgery_schedule` และ `sale_incentive`

---

## 🗄️ Database Schema

### 1. ตาราง `surgery_schedule`

เก็บข้อมูลตารางนัดผ่าตัด (แทนที่ Google Sheets "Film data")

**คอลัมน์สำคัญ:**

- `id` - Primary key (auto-increment)
- `doctor` - หมอ
- `contact_person` - ผู้ติดต่อ (จีน, มุก, เจ, ว่าน)
- `customer_name` - ชื่อลูกค้า
- `phone` - เบอร์โทร
- `date_surgery_scheduled` - วันที่ได้นัดผ่าตัด (P table)
- `surgery_date` - วันที่ผ่าตัด (L table)
- `proposed_amount` - ยอดนำเสนอ (Revenue)
- `appointment_time` - เวลาที่นัด
- `notes` - หมายเหตุ

### 2. ตาราง `sale_incentive`

เก็บข้อมูลรายรับจริง (แทนที่ Google Sheets "N_SaleIncentive")

**คอลัมน์สำคัญ:**

- `id` - Primary key (auto-increment)
- `sale_person` - พนักงานขาย (จีน, มุก, เจ, ว่าน)
- `sale_date` - วันที่บันทึกยอดขาย
- `income` - รายรับ (บาท)
- `day`, `month`, `year` - วันที่แยกออกมา (auto-populated)
- `customer_name` - ชื่อลูกค้า
- `notes` - หมายเหตุ

---

## 🚀 ขั้นตอนการติดตั้ง

### Step 1: สร้างตารางในฐานข้อมูล

รันไฟล์ SQL schema เพื่อสร้างตารางและ indexes:

```bash
# สำหรับ PostgreSQL
psql -h DB_HOST -U DB_USER -d DB_NAME -f surgery-schedule-schema.sql
```

หรือใช้ tool อย่าง pgAdmin, DBeaver, หรือ Supabase Dashboard

### Step 2: ตั้งค่า Environment Variables

เพิ่ม environment variables ในไฟล์ `.env.local`:

```env
# PostgreSQL Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
```

**สำหรับ Vercel:**
ไปที่ Settings → Environment Variables และเพิ่มค่าเหล่านี้

### Step 3: Migrate ข้อมูลจาก Google Sheets (ถ้าต้องการ)

ใช้สคริปต์ `migrate-google-sheets-to-db.ts` เพื่อย้ายข้อมูลจาก Google Sheets เข้า Database:

```bash
# รันสคริปต์ migrate
npm run migrate:sheets-to-db
```

---

## 📡 API Endpoints

### Surgery Schedule API

**GET** `/api/surgery-schedule-db`

- ดึงข้อมูลนัดผ่าตัด
- Query parameters:
  - `month` (1-12) - กรองตามเดือน
  - `year` - กรองตามปี
  - `contact_person` - กรองตามผู้ติดต่อ

**POST** `/api/surgery-schedule-db`

- เพิ่มข้อมูลนัดผ่าตัดใหม่
- Body: `{ doctor, contact_person, customer_name, phone, date_surgery_scheduled, ... }`

**PUT** `/api/surgery-schedule-db`

- อัพเดทข้อมูลนัดผ่าตัด
- Body: `{ id, ...updateFields }`

**DELETE** `/api/surgery-schedule-db?id={id}`

- ลบข้อมูลนัดผ่าตัด

### Sale Incentive API

**GET** `/api/sale-incentive-db`

- ดึงข้อมูลรายรับ
- Query parameters:
  - `month` (1-12) - กรองตามเดือน
  - `year` - กรองตามปี
  - `sale_person` - กรองตามพนักงานขาย

**POST** `/api/sale-incentive-db`

- เพิ่มข้อมูลรายรับใหม่
- Body: `{ sale_person, sale_date, income, customer_name, notes }`

**PUT** `/api/sale-incentive-db`

- อัพเดทข้อมูลรายรับ
- Body: `{ id, ...updateFields }`

**DELETE** `/api/sale-incentive-db?id={id}`

- ลบข้อมูลรายรับ

---

## 🔄 ทดสอบการทำงาน

### 1. ตรวจสอบ Database Connection

```bash
# ตรวจสอบว่าเชื่อมต่อ database ได้
node -e "const pool = require('./src/lib/db').default; pool.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message));"
```

### 2. ทดสอบ API

```bash
# ทดสอบ Surgery Schedule API
curl http://localhost:3000/api/surgery-schedule-db

# ทดสอบ Sale Incentive API
curl http://localhost:3000/api/sale-incentive-db
```

### 3. ทดสอบบน Production

เปิดหน้า Performance Surgery Schedule:

```
https://your-domain.vercel.app/performance-surgery-schedule
```

ตรวจสอบว่า:

- ✅ ข้อมูลแสดงผลถูกต้อง
- ✅ มีข้อความ "(PostgreSQL Database)" แสดงที่มุมขวาบน
- ✅ ตัวเลข KPI คำนวณถูกต้อง

---

## 📊 ตัวอย่างการใช้งาน

### เพิ่มข้อมูลนัดผ่าตัด

```javascript
const response = await fetch("/api/surgery-schedule-db", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    doctor: "นพ.ทดสอบ",
    contact_person: "จีน",
    customer_name: "ลูกค้าทดสอบ",
    phone: "0812345678",
    date_surgery_scheduled: "2024-12-01",
    appointment_time: "10:00",
    surgery_date: "2024-12-15",
    proposed_amount: 50000,
  }),
});
```

### เพิ่มข้อมูลรายรับ

```javascript
const response = await fetch("/api/sale-incentive-db", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sale_person: "จีน",
    sale_date: "2024-12-01",
    income: 50000,
    customer_name: "ลูกค้าทดสอบ",
    notes: "ยอดขายเดือนธันวาคม",
  }),
});
```

---

## 🔍 Troubleshooting

### ปัญหา: ไม่สามารถเชื่อมต่อ database ได้

**วิธีแก้:**

1. ตรวจสอบว่า environment variables ถูกต้อง
2. ตรวจสอบว่า database server กำลังทำงานอยู่
3. ตรวจสอบ firewall และ security group ให้อนุญาต connection

### ปัญหา: ตารางไม่พบ (Table not found)

**วิธีแก้:**

1. รันไฟล์ `surgery-schedule-schema.sql` เพื่อสร้างตาราง
2. ตรวจสอบว่าใช้ database ที่ถูกต้อง
3. ตรวจสอบ schema name (ถ้ามี)

### ปัญหา: ข้อมูลไม่แสดงผล

**วิธีแก้:**

1. ตรวจสอบว่ามีข้อมูลในตาราง (ใช้ SQL: `SELECT * FROM surgery_schedule LIMIT 10`)
2. ตรวจสอบ console log ใน browser DevTools
3. ตรวจสอบ Network tab ว่า API call สำเร็จหรือไม่

### ปัญหา: Cache ไม่ update

**วิธีแก้:**

1. Hard refresh browser (Ctrl+Shift+R หรือ Cmd+Shift+R)
2. Clear cache ใน API route (restart Next.js server)
3. ตรวจสอบว่า `Cache-Control` headers ถูกต้อง

---

## 📈 Performance Optimization

### 1. Indexes

Schema มี indexes สำหรับ queries ที่ใช้บ่อย:

- `idx_surgery_person_scheduled_date` - filter by person and date
- `idx_sale_person_date` - filter by person and date

### 2. Caching

- API routes มี in-memory cache (30 วินาที)
- Browser cache ใช้ `Cache-Control` headers

### 3. Connection Pooling

- ใช้ `pg.Pool` สำหรับ connection pooling
- Max connections: 20
- Idle timeout: 30 วินาที

---

## 🔐 Security

### 1. SQL Injection Prevention

- ใช้ parameterized queries (`$1`, `$2`, ...) ทุกครั้ง
- ไม่ concatenate SQL strings โดยตรง

### 2. Input Validation

- Validate required fields ก่อน insert/update
- Validate data types และ formats

### 3. Environment Variables

- ไม่ commit `.env.local` เข้า Git
- ใช้ Vercel Environment Variables สำหรับ production

---

## 📚 ไฟล์ที่เกี่ยวข้อง

### Schema

- `surgery-schedule-schema.sql` - Database schema

### API Routes

- `src/app/api/surgery-schedule-db/route.ts` - Surgery Schedule API
- `src/app/api/sale-incentive-db/route.ts` - Sale Incentive API

### Utils

- `src/utils/databaseFilmData.ts` - Surgery Schedule utilities
- `src/utils/databaseSaleIncentive.ts` - Sale Incentive utilities

### Page

- `src/app/(fullscreen)/performance-surgery-schedule/page.tsx` - Performance page

### Database Connection

- `src/lib/db.ts` - PostgreSQL connection pool

---

## 🎯 Next Steps

1. **Migrate ข้อมูลเก่า**: ย้ายข้อมูลจาก Google Sheets เข้า Database
2. **สร้าง Admin Interface**: เพิ่มหน้าสำหรับจัดการข้อมูล (CRUD)
3. **เพิ่ม Webhook**: Auto-sync ข้อมูลจากแหล่งอื่นเข้า Database
4. **สร้าง Backup**: ตั้งค่า automated backup สำหรับ Database
5. **Monitoring**: เพิ่ม logging และ monitoring สำหรับ API

---

## 📞 Support

หากมีปัญหาหรือคำถาม:

1. ตรวจสอบ logs ใน console และ Vercel
2. อ่าน Troubleshooting section ด้านบน
3. ตรวจสอบว่า environment variables ถูกต้อง
4. ทดสอบ database connection โดยตรง

---

**เอกสารอัพเดท:** 2024-12-17  
**เวอร์ชัน:** 1.0.0

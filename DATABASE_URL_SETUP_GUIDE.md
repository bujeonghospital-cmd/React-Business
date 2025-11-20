# 🔧 การตั้งค่า DATABASE_URL

## ❌ ปัญหาที่พบ

```json
{
  "success": false,
  "error": "Database configuration missing",
  "details": "DATABASE_URL environment variable is not set"
}
```

## ✅ วิธีแก้ไข

### 1. สร้างไฟล์ `.env.local` (ถ้ายังไม่มี)

```bash
# Windows PowerShell
Copy-Item .env.local.example .env.local
```

หรือ

```bash
# Windows CMD
copy .env.local.example .env.local
```

### 2. แก้ไขไฟล์ `.env.local`

เปิดไฟล์ `.env.local` และเพิ่มหรือแก้ไขบรรทัดนี้:

```env
DATABASE_URL=postgresql://postgres:Bjh12345!!@n8n.bjhbangkok.com:5432/postgres
```

### 3. รีสตาร์ท Development Server

**สำคัญมาก!** ต้อง restart server เพื่อให้อ่าน environment variables ใหม่:

```bash
# กด Ctrl+C เพื่อหยุด server ที่กำลังรันอยู่
# จากนั้นรันใหม่อีกครั้ง
npm run dev
```

หรือ

```bash
yarn dev
```

### 4. ทดสอบการเชื่อมต่อ

เปิดเบราว์เซอร์และทดสอบ:

```
http://localhost:3000/api/database-test
```

ควรได้ผลลัพธ์:

```json
{
  "success": true,
  "diagnostics": {
    "hasEnvVar": true,
    "currentDatabase": "postgres",
    "currentSchema": "public",
    "availableSchemas": ["BJH-Server", "public", "postgres"],
    "tableLocations": [...]
  }
}
```

### 5. ทดสอบ Status Options API

```
http://localhost:3000/api/status-options
```

## 📝 รูปแบบ DATABASE_URL

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**ตัวอย่าง:**

```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb

# Supabase
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Railway
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Vercel Postgres
DATABASE_URL=postgres://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb

# n8n.bjhbangkok.com (ของคุณ)
DATABASE_URL=postgresql://postgres:Bjh12345!!@n8n.bjhbangkok.com:5432/postgres
```

## ⚠️ หมายเหตุสำคัญ

1. **อย่า commit ไฟล์ `.env.local`** ไปใน git (ไฟล์นี้อยู่ใน `.gitignore` แล้ว)
2. **ต้อง restart server** ทุกครั้งที่แก้ไข `.env.local`
3. **ตรวจสอบ password** ให้แน่ใจว่าไม่มีอักขระพิเศษที่ต้อง encode (เช่น `@`, `#`, `?`)
4. **ตรวจสอบ firewall** ให้แน่ใจว่า server สามารถเข้าถึง database host ได้

## 🔍 การ Debug เพิ่มเติม

ถ้ายังไม่ทำงาน ให้ตรวจสอบ:

### ตรวจสอบว่าไฟล์ .env.local มีจริง:

```powershell
Test-Path .env.local
# ควรแสดง: True
```

### ดูเนื้อหาในไฟล์:

```powershell
Get-Content .env.local | Select-String "DATABASE_URL"
# ควรแสดง: DATABASE_URL=postgresql://...
```

### ทดสอบ connection จาก command line:

```powershell
# ใช้ psql (ถ้าติดตั้งไว้)
psql "postgresql://postgres:Bjh12345!!@n8n.bjhbangkok.com:5432/postgres"
```

### ตรวจสอบว่า table มีอยู่จริง:

```sql
-- รันใน PostgreSQL client
SELECT * FROM "BJH-Server".status_options LIMIT 5;
```

## 📞 ติดปัญหา?

ถ้ายังไม่ได้ ให้:

1. ตรวจสอบ error message ใน terminal
2. ตรวจสอบ browser console (F12)
3. ลอง API `/api/database-test` เพื่อดู diagnostics

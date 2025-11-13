# 🐍 Python API - Quick Start Guide

## 📋 สรุป

Python API นี้ทำหน้าที่ดึงข้อมูลจาก Google Sheets "Film data" และให้บริการผ่าน REST API

## 🚀 วิธีรัน (Local Development)

### 1. ติดตั้ง Dependencies

```powershell
cd python-api
pip install -r requirements.txt
```

### 2. ตรวจสอบไฟล์ .env

ไฟล์ `.env` ถูกสร้างให้อัตโนมัติแล้วโดยมีข้อมูลจาก `.env.local` หลัก

ตรวจสอบว่ามีค่าต่อไปนี้:

- ✅ `GOOGLE_SPREADSHEET_ID`
- ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- ✅ `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### 3. รัน Python API

```powershell
python app.py
```

หรือ

```powershell
flask run
```

API จะรันที่: `http://localhost:5000`

### 4. ทดสอบ API

เปิดเบราว์เซอร์หรือใช้ PowerShell:

```powershell
# Health check
curl http://localhost:5000/health

# ดึงข้อมูลทั้งหมด
curl http://localhost:5000/api/film-data
```

### 5. รัน Next.js (Terminal แยก)

```powershell
# ใน terminal ใหม่ กลับไปที่ root
cd ..
npm run dev
```

### 6. เปิดหน้าเว็บ

ไปที่: `http://localhost:3000/performance-surgery-schedule`

---

## 📡 API Endpoints

| Endpoint           | Method | คำอธิบาย                       |
| ------------------ | ------ | ------------------------------ |
| `/`                | GET    | ข้อมูลเกี่ยวกับ API            |
| `/health`          | GET    | Health check และ cache status  |
| `/api/film-data`   | GET    | ดึงข้อมูลจาก Google Sheets     |
| `/api/clear-cache` | POST   | Clear cache (รีเฟรชข้อมูลใหม่) |

---

## 🎯 Deploy บน Railway

### ขั้นตอนที่ 1: Push Code ขึ้น GitHub

```powershell
git add python-api/
git commit -m "Add Python API for surgery schedule"
git push origin main
```

### ขั้นตอนที่ 2: สร้าง Railway Project

1. ไปที่ https://railway.app
2. Sign in ด้วย GitHub
3. คลิก **"New Project"**
4. เลือก **"Deploy from GitHub repo"**
5. เลือก repository: `React-Business`
6. **Settings** → **Root Directory**: ตั้งเป็น `python-api`
7. คลิก **Deploy**

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables บน Railway

ใน Railway Dashboard → Variables tab:

```
GOOGLE_SPREADSHEET_ID=1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y

GOOGLE_SERVICE_ACCOUNT_EMAIL=web-sheets-reader@name-tel-dev.iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
(คัดลอกทั้ง private key ตาม .env)
-----END PRIVATE KEY-----

GOOGLE_PROJECT_ID=name-tel-dev

FLASK_ENV=production

PORT=5000
```

⚠️ **สำคัญ**:

- Private key ต้องใส่แบบ multi-line จริงๆ (ไม่ใช่ `\n`)
- หรือใส่แบบ JSON string ก็ได้ แต่ต้องมี `\n` แทน newline

### ขั้นตอนที่ 4: รอ Deploy เสร็จ

Railway จะ deploy และให้ URL เช่น:

```
https://your-app.up.railway.app
```

### ขั้นตอนที่ 5: อัพเดท Next.js Environment Variable

ใน Vercel Dashboard:

1. Settings → Environment Variables
2. แก้ไข `PYTHON_API_URL` เป็น Railway URL
3. Redeploy Next.js

---

## 🔍 Troubleshooting

### ปัญหา: ImportError หรือ ModuleNotFoundError

```powershell
pip install -r requirements.txt --force-reinstall
```

### ปัญหา: Google Sheets 403 Forbidden

1. ตรวจสอบว่า Service Account Email ถูก share เข้า Google Sheet แล้ว
2. ตรวจสอบว่า Private Key ถูกต้อง (มี `-----BEGIN PRIVATE KEY-----`)
3. ตรวจสอบว่าชีทชื่อ "Film data" มีอยู่จริง

### ปัญหา: Port 5000 ถูกใช้งานแล้ว

แก้ไข `.env`:

```env
PORT=5001
```

และแก้ `.env.local` ของ Next.js:

```env
PYTHON_API_URL=http://localhost:5001
```

### ปัญหา: Next.js ไม่เชื่อมต่อกับ Python API

1. ตรวจสอบว่า Python API รันอยู่
2. ตรวจสอบ `PYTHON_API_URL` ใน `.env.local`
3. ดู Console logs ใน Browser DevTools และ Python API terminal

---

## 📦 ไฟล์ที่สร้างแล้ว

```
python-api/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Procfile           # Railway/Heroku deployment
├── runtime.txt        # Python version
├── .env               # Environment variables (local)
├── .env.example       # Environment template
└── .gitignore         # Git ignore file
```

---

## 🎉 เสร็จสิ้น!

ตอนนี้คุณมี Python API ที่:

- ✅ อ่านข้อมูลจาก Google Sheets
- ✅ มี caching 30 วินาที
- ✅ พร้อม deploy บน Railway
- ✅ เชื่อมต่อกับ Next.js ได้

---

## 📚 เอกสารเพิ่มเติม

- `PYTHON_API_RAILWAY_GUIDE.md` - คู่มือ deploy บน Railway
- `PYTHON_API_SURGERY_SCHEDULE_GUIDE.md` - คู่มือการใช้งานครบวงจร

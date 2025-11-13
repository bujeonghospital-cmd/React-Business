# 📦 ไฟล์ที่จำเป็นสำหรับ Railway Deployment

โปรเจ็กต์นี้มีไฟล์ configuration ครบถ้วนสำหรับ deploy ไปยัง Railway แล้ว

## ✅ ไฟล์ที่มีอยู่แล้ว

### 1. `requirements.txt`

```txt
flask==3.0.0
flask-cors==4.0.0
google-auth==2.25.2
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
google-api-python-client==2.110.0
python-dotenv==1.0.0
gunicorn==21.2.0
```

**Purpose:** ระบุ Python packages ที่ต้องติดตั้ง

---

### 2. `Procfile`

```
web: gunicorn app:app
```

**Purpose:** บอก Railway ว่าจะรันคำสั่งอะไรเมื่อ start application

---

### 3. `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Purpose:**

- กำหนดวิธีการ build และ deploy
- ตั้งค่า health check endpoint
- กำหนดจำนวน workers และ timeout
- Auto-restart เมื่อเกิด failure

---

### 4. `runtime.txt`

```
python-3.11.0
```

**Purpose:** ระบุเวอร์ชัน Python ที่ต้องการใช้

---

### 5. `.env.example`

```bash
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Purpose:** Template สำหรับ environment variables

---

## 🎯 ขั้นตอนการใช้งาน

1. **อ่าน**: `RAILWAY_QUICK_START.md` สำหรับเริ่มต้นใน 5 นาที
2. **อ่าน**: `RAILWAY_DEPLOYMENT_GUIDE.md` สำหรับรายละเอียดทั้งหมด
3. **Deploy**: ตาม checklist ใน guide

---

## 📝 Checklist

- [x] `requirements.txt` - ✅ มีแล้ว
- [x] `Procfile` - ✅ มีแล้ว
- [x] `railway.json` - ✅ มีแล้ว (อัพเดทแล้ว)
- [x] `runtime.txt` - ✅ มีแล้ว
- [x] `.env.example` - ✅ มีแล้ว
- [x] `app.py` - ✅ มี Flask application
- [x] `/health` endpoint - ✅ มีใน app.py

---

## 🚀 พร้อม Deploy!

ไฟล์ทั้งหมดพร้อมแล้ว เพียงแค่:

1. Push code ไป GitHub
2. เชื่อมต่อกับ Railway
3. ตั้งค่า Environment Variables
4. Deploy!

ดูขั้นตอนละเอียดใน: **`RAILWAY_QUICK_START.md`**

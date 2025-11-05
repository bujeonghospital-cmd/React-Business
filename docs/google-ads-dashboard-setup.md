# Google Ads Dashboard — Setup & Notes

ไฟล์ที่เพิ่ม:

- `src/app/api/google-ads/route.ts` — Next.js server route ที่ใช้ OAuth2 refresh token เพื่อขอ access token แล้วเรียก Google Ads API (GAQL)
- `src/app/google-ads-dashboard/page.tsx` — หน้า client ที่ดึงข้อมูลจาก API route และแสดงตาราง/สรุป

ตัวแปรสภาพแวดล้อมที่ต้องตั้ง (ตัวอย่างตั้งในเครื่องหรือบน host):

- `GOOGLE_ADS_CLIENT_ID` — OAuth2 client ID
- `GOOGLE_ADS_CLIENT_SECRET` — OAuth2 client secret
- `GOOGLE_ADS_REFRESH_TOKEN` — Refresh token สำหรับบัญชี Google ที่เข้าถึง Google Ads
- `GOOGLE_ADS_DEVELOPER_TOKEN` — Developer token จาก Google Ads
- `GOOGLE_ADS_CUSTOMER_ID` — รหัส customer (รูปแบบ: 1234567890)
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` — (optional) ถ้าต้องใช้ login-customer-id header

ตัวอย่างวิธีตั้ง env (Windows cmd.exe):

```cmd
set GOOGLE_ADS_CLIENT_ID=your-client-id
set GOOGLE_ADS_CLIENT_SECRET=your-client-secret
set GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
set GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
set GOOGLE_ADS_CUSTOMER_ID=1234567890
set GOOGLE_ADS_LOGIN_CUSTOMER_ID=optional-login-customer-id
```

รันแอปในโหมดพัฒนา (ถ้าโปรเจคเป็น Next.js ปกติ):

```cmd
npm install
npm run dev
```

การทดสอบ API (หลังรัน app):

- เปิด `http://localhost:3000/google-ads-dashboard` เพื่อดูหน้า dashboard
- ตรวจสอบ API ตรง: `http://localhost:3000/api/google-ads?from=2025-01-01&to=2025-04-04` จะคืน JSON

หมายเหตุสำคัญ / caveats:

- โค้ดตัวอย่างใช้ REST endpoint `googleAds:search` และคาดว่า response มี `results` array; field ชื่อใน JSON อาจแตกต่างกันเล็กน้อย (เช่น `metrics.averageCpc` vs `metrics.average_cpc`) ขึ้นกับเวอร์ชันและรูปแบบ — ถ้าเห็นค่า undefined ให้เปิด response ดิบแล้วปรับ mapping ใน `route.ts` ตามโครงสร้างจริง
- ค่าเงินใน Google Ads มักเก็บเป็น micros (1,000,000 micros = 1 unit) — โค้ดนี้แปลง `cost_micros` และ `average_cpc` โดยหารด้วย 1e6
- เก็บ secret (client secret, refresh token, developer token) อย่างปลอดภัย ใช้ secret management ใน production
- หากต้องการประสิทธิภาพสูงหรือ streaming ข้อมูล ปรับไปใช้ `googleAds:searchStream` หรือไลบรารีอย่างเป็นทางการ

ต้องการให้ผม:

1. ช่วยต่อสาย (test) ด้วย credentials ที่คุณจะให้ (ถ้าต้องการผมช่วยรันและตรวจผล)
2. ปรับ UI ให้เหมือนรูปภาพ Google Ads Dashboard ที่คุณมี (ส่งรูปหรือระบุองค์ประกอบที่ต้องการ)
3. แปะตัวอย่าง unit test หรือ mock response เพื่อรัน CI

บอกผมว่าต้องการขั้นต่อไปแบบไหน (ทดสอบด้วย credential, ปรับ UI, หรือเพิ่มตัวเลือก date range/filters) แล้วผมจะดำเนินการต่อ

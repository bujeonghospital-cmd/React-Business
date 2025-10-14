# วิธีการตั้งค่า Google Maps API สำหรับหน้า Contact Inquiry

## ขั้นตอนการขอ API Key จาก Google Cloud Platform

### 1. สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มีอยู่

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. คลิก **Select a project** ที่มุมบนซ้าย
3. คลิก **NEW PROJECT** เพื่อสร้างโปรเจกต์ใหม่
4. ตั้งชื่อโปรเจกต์ เช่น "TPP-Website"
5. คลิก **Create**

### 2. เปิดใช้งาน Maps APIs

1. ไปที่ [Google Maps Platform](https://console.cloud.google.com/google/maps-apis/)
2. คลิก **Enable APIs and Services**
3. ค้นหาและเปิดใช้งาน APIs ต่อไปนี้:
   - **Maps Embed API** (สำหรับแสดงแผนที่แบบ iframe)
   - **Maps JavaScript API** (ถ้าต้องการใช้ฟีเจอร์เพิ่มเติม)
   - **Geocoding API** (ถ้าต้องการแปลงที่อยู่เป็นพิกัด)

### 3. สร้าง API Key

1. ไปที่ [Credentials](https://console.cloud.google.com/apis/credentials)
2. คลิก **+ CREATE CREDENTIALS**
3. เลือก **API key**
4. คัดลอก API Key ที่ได้

### 4. จำกัดการใช้งาน API Key (แนะนำ)

เพื่อความปลอดภัย ควรจำกัดการใช้งาน API Key:

1. คลิกที่ API Key ที่สร้างขึ้น
2. ในส่วน **API restrictions**:

   - เลือก **Restrict key**
   - เลือก APIs ที่ต้องการใช้:
     - Maps Embed API
     - Maps JavaScript API
     - Geocoding API

3. ในส่วน **Website restrictions**:

   - เลือก **HTTP referrers (web sites)**
   - เพิ่ม URL ของเว็บไซต์:
     ```
     http://localhost:3000/*
     https://yourdomain.com/*
     https://*.yourdomain.com/*
     ```

4. คลิก **Save**

### 5. ตั้งค่า API Key ในโปรเจกต์

1. สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจกต์
2. เพิ่ม API Key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Restart development server:

```bash
npm run dev
```

## การหาพิกัดสถานที่

### วิธีที่ 1: ใช้ Google Maps

1. เปิด [Google Maps](https://www.google.com/maps)
2. ค้นหาสถานที่ที่ต้องการ
3. คลิกขวาที่ตำแหน่งบนแผนที่
4. คลิกที่ตัวเลขพิกัด (จะคัดลอกอัตโนมัติ)
5. รูปแบบ: `13.9952, 100.6405` (latitude, longitude)

### วิธีที่ 2: ใช้ Geocoding API

หรือคุณสามารถใช้ address ตรงๆ แทนพิกัดได้ โดยแก้ไขใน `page.tsx`:

```typescript
// แทนที่
coordinates: { lat: 13.9952, lng: 100.6405 }

// ด้วย
address: "55/5 หมู่ 5 ถนนพหลโยธิน ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี"
```

## อัพเดทพิกัดในโค้ด

แก้ไขไฟล์ `src/app/contact-inquiry/page.tsx`:

```typescript
const COMPANY_INFO = {
  // ...
  headquarters: {
    // ...
    coordinates: { lat: 13.9952, lng: 100.6405 }, // อัพเดทพิกัดจริง
  },
  factory: {
    // ...
    coordinates: { lat: 13.6425, lng: 100.7328 }, // อัพเดทพิกัดจริง
  },
};
```

## ราคาและโควต้า

- **Maps Embed API**: ฟรี (ไม่จำกัด)
- **Maps JavaScript API**:
  - $200 เครดิตฟรีต่อเดือน
  - ~28,000 map loads ฟรีต่อเดือน
  - เกินโควต้าจะเริ่มคิดค่าใช้จ่าย

## การตรวจสอบการใช้งาน

ตรวจสอบการใช้งาน API ได้ที่:

- [Google Cloud Console - APIs & Services - Dashboard](https://console.cloud.google.com/apis/dashboard)

## Troubleshooting

### แผนที่ไม่แสดง

1. ตรวจสอบว่าเปิดใช้งาน Maps Embed API แล้ว
2. ตรวจสอบ API Key ถูกต้อง
3. ตรวจสอบ website restrictions (ถ้าตั้งไว้)
4. เช็ค Console ใน Browser (F12) ดู error

### พิกัดไม่ถูกต้อง

1. ตรวจสอบรูปแบบ: `{ lat: number, lng: number }`
2. Latitude ต้องอยู่ระหว่าง -90 ถึง 90
3. Longitude ต้องอยู่ระหว่าง -180 ถึง 180

## ทางเลือกอื่นๆ

หากไม่ต้องการใช้ Google Maps API:

### 1. OpenStreetMap (ฟรี)

```typescript
<iframe
  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${
    lat - 0.01
  },${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
  width="100%"
  height="100%"
  style={{ border: 0 }}
/>
```

### 2. Leaflet + OpenStreetMap

ติดตั้ง:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

## ติดต่อสอบถาม

หากมีปัญหาในการตั้งค่า สามารถติดต่อทีมพัฒนาได้

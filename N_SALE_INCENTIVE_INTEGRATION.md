# การเชื่อมต่อ N_SaleIncentive API กับ Performance Surgery Schedule

## 📋 ภาพรวม

เอกสารนี้อธิบายการเชื่อมต่อข้อมูลรายรับจาก Google Sheet "N_SaleIncentive" มาแสดงในหน้า **Performance - นัดผ่าตัด** โดยแทนที่การคำนวณรายรับจาก surgery data ด้วยข้อมูลรายรับจริงจากระบบ

---

## 🔗 API Endpoint

### Python API (Railway)
```
https://believable-ambition-production.up.railway.app/N_SaleIncentive_data
```

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "day": 19,
      "income": 20000.0,
      "month": 11,
      "sale_date": "2024-11-19",
      "sale_person": "จีน",
      "year": 2024
    },
    ...
  ],
  "total_records": 9907,
  "timestamp": "2025-11-15T07:04:08.948755"
}
```

---

## 📁 ไฟล์ที่สร้างใหม่

### 1. `src/utils/saleIncentiveApi.ts`
Utility functions สำหรับดึงและประมวลผลข้อมูล N_SaleIncentive

**หน้าที่:**
- `fetchSaleIncentiveFromPythonAPI()` - ดึงข้อมูลทั้งหมดจาก API
- `calculateDailyRevenueByPerson()` - คำนวณรายรับรายวันตามผู้ติดต่อ
- `SaleIncentiveData` interface - กำหนดโครงสร้างข้อมูล

**Key Features:**
- รองรับ client-side caching
- กรองข้อมูลตามเดือนและปี
- รวมรายรับของแต่ละคนในแต่ละวัน

### 2. `src/app/api/sale-incentive-python/route.ts`
Next.js API route สำหรับดึงข้อมูลจาก Python API

**หน้าที่:**
- ทำหน้าที่เป็น proxy ระหว่าง frontend และ Python API
- Caching data เพื่อลด API calls
- Handle errors และ fallback ไปใช้ cached data

**Cache Duration:**
- 30 วินาที (CACHE_DURATION = 30000)
- Stale-while-revalidate: 60 วินาที

---

## 🔄 การแก้ไข `page.tsx`

### เพิ่ม Import
```typescript
import {
  fetchSaleIncentiveFromPythonAPI,
  calculateDailyRevenueByPerson,
  SaleIncentiveData,
} from "@/utils/saleIncentiveApi";
```

### เพิ่ม State
```typescript
const [saleIncentiveData, setSaleIncentiveData] = useState<SaleIncentiveData[]>([]);
```

### อัพเดต loadData Function
```typescript
const loadData = async (isManualRefresh = false) => {
  // ... existing code ...
  
  // Fetch surgery schedule data
  const data = await fetchSurgeryScheduleFromPythonAPI();
  setSurgeryData(data);

  // Fetch N_SaleIncentive data (NEW)
  const saleData = await fetchSaleIncentiveFromPythonAPI();
  setSaleIncentiveData(saleData);
  
  // ... rest of code ...
};
```

### แยก useEffect สำหรับ Revenue
```typescript
// Update revenue map when N_SaleIncentive data changes
useEffect(() => {
  if (saleIncentiveData.length > 0) {
    const newRevenueMap = calculateDailyRevenueByPerson(
      saleIncentiveData,
      selectedMonth,
      selectedYear
    );
    setRevenueMap(newRevenueMap);
  } else {
    setRevenueMap(new Map());
  }
}, [saleIncentiveData, selectedMonth, selectedYear]);
```

---

## 💡 วิธีการทำงาน

### 1. Data Flow
```
Google Sheets (N_SaleIncentive)
    ↓
Python API (Railway) - /N_SaleIncentive_data
    ↓
Next.js API Route - /api/sale-incentive-python
    ↓
Frontend (page.tsx) - fetchSaleIncentiveFromPythonAPI()
    ↓
calculateDailyRevenueByPerson() - คำนวณรายรับรายวัน
    ↓
revenueMap - แสดงในตาราง "ประมาณการรายรับ"
```

### 2. การรวมข้อมูลผู้ติดต่อ

**จีน & มุก:**
- Row ID: `105-จีน`
- รวมรายรับจากทั้ง "จีน" และ "มุก"

**เจ:**
- Row ID: `107-เจ`
- แสดงรายรับของ "เจ"

**ว่าน:**
- Row ID: `108-ว่าน`
- แสดงรายรับของ "ว่าน"

### 3. การคำนวณ KPI

**KPI To Date (Revenue):**
```
KPI To Date = (KPI Month / Total Weekdays) × Weekdays Passed
```

สำหรับ "105-จีน & มุก":
```
KPI To Date = (KPI Month × 2 / Total Weekdays) × Weekdays Passed
```

**Actual (Revenue):**
```
Actual = ผลรวมรายรับจาก N_SaleIncentive ในเดือนนั้น
```

**Diff:**
```
Diff = Actual - KPI To Date
```
- สีเขียว: Diff ≥ 0
- สีแดง: Diff < 0

---

## 🎯 ความแตกต่างจากเดิม

### ก่อนหน้า (ใช้ calculateRevenueByDateAndPerson)
- คำนวณรายรับจาก column "ยอดนำเสนอ" ใน Film data
- ใช้วันที่ได้นัดผ่าตัด (P) เป็นเกณฑ์
- อาจไม่ตรงกับรายรับจริง

### หลังการอัพเดต (ใช้ N_SaleIncentive)
- ใช้ข้อมูลรายรับจริงจาก N_SaleIncentive sheet
- มีข้อมูล sale_person, sale_date, และ income ที่แม่นยำ
- แยก sheet เพื่อให้จัดการข้อมูลรายรับได้ง่ายขึ้น

---

## 🚀 การ Deploy

### 1. Environment Variables

#### Railway (Python API)
ตรวจสอบว่ามี endpoints:
```python
@app.route('/N_SaleIncentive_data', methods=['GET'])
def get_n_sale_incentive_data():
    # ... implementation ...
```

#### Vercel (Next.js)
```env
PYTHON_API_URL=https://believable-ambition-production.up.railway.app
```

### 2. การทดสอบ API

**Test Python API:**
```bash
curl https://believable-ambition-production.up.railway.app/N_SaleIncentive_data
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...],
  "total_records": 9907,
  "timestamp": "..."
}
```

**Test Next.js API Route:**
```bash
curl http://localhost:3000/api/sale-incentive-python
```

### 3. Deploy Steps
1. Commit และ push code ไป GitHub
2. Vercel จะ auto-deploy
3. ตรวจสอบว่า Environment Variables ครบถ้วน
4. ทดสอบหน้า Performance Surgery Schedule

---

## 📊 ตาราง "ประมาณการรายรับ"

### Columns

| Column | คำอธิบาย | การคำนวณ |
|--------|---------|---------|
| KPI Month | เป้าหมายรายรับทั้งเดือน | กำหนดใน kpiData (× 25,000 บาท) |
| KPI To Date | เป้าหมายรายรับ ณ ปัจจุบัน | (KPI Month / วันทำงานทั้งเดือน) × วันทำงานที่ผ่านมา |
| Actual | รายรับจริง ณ ปัจจุบัน | ผลรวมจาก N_SaleIncentive |
| Diff | ส่วนต่าง | Actual - KPI To Date |
| วันที่ 1-31 | รายรับแต่ละวัน | จาก N_SaleIncentive |

### Features
- คลิกที่เซลล์ที่มีรายรับเพื่อดูรายละเอียด surgery
- แสดงยอดรวมเป็นหน่วยบาท (ไม่แสดงถ้าเป็น 0)
- สีเซลล์เปลี่ยนเมื่อมีข้อมูล

---

## 🐛 Troubleshooting

### ปัญหา: ไม่แสดงข้อมูลรายรับ

**แก้ไข:**
1. เช็ค console logs:
   ```
   ✅ Successfully fetched X N_SaleIncentive records from Python API
   💰 Calculate Revenue from N_SaleIncentive: ...
   ```

2. ตรวจสอบ API endpoint:
   ```bash
   curl https://believable-ambition-production.up.railway.app/N_SaleIncentive_data
   ```

3. ตรวจสอบว่า sale_person ตรงกับ CONTACT_PERSON_MAPPING

### ปัญหา: รายรับไม่ตรงกับเดือนที่เลือก

**แก้ไข:**
- ตรวจสอบว่า `calculateDailyRevenueByPerson` filter เดือน/ปีถูกต้อง
- เช็คว่า API ส่ง month เป็น 1-12 (ไม่ใช่ 0-11)
- ตรวจสอบ timezone ของ sale_date

### ปัญหา: Performance ช้า

**แก้ไข:**
- Caching ทำงานอยู่ที่ 30 วินาที
- ใช้ auto-refresh ทุก 30 วินาทีเท่านั้น
- ถ้ายังช้า ให้เพิ่ม CACHE_DURATION ใน route.ts

---

## ✅ Checklist การตรวจสอบ

- [x] สร้างไฟล์ `saleIncentiveApi.ts`
- [x] สร้าง API route `/api/sale-incentive-python/route.ts`
- [x] อัพเดต `page.tsx` เพื่อใช้ N_SaleIncentive
- [x] แยก useEffect สำหรับ revenue calculation
- [x] อัพเดตการแสดงจำนวนข้อมูลใน UI
- [x] ทดสอบว่าไม่มี TypeScript errors
- [ ] ทดสอบ API endpoint ใน production
- [ ] Deploy ไป Vercel
- [ ] ตรวจสอบข้อมูลรายรับในตาราง
- [ ] ทดสอบ modal รายละเอียด surgery

---

## 📝 หมายเหตุ

1. **Auto-refresh**: ระบบจะ refresh ข้อมูลทุก 30 วินาทีอัตโนมัติ
2. **Manual refresh**: ผู้ใช้สามารถกดปุ่ม "🔄 รีเฟรชข้อมูล" ได้
3. **Caching**: ข้อมูลจะถูก cache เพื่อลดการเรียก API
4. **Error handling**: ถ้า API error จะใช้ cached data แทน

---

## 🔮 การพัฒนาต่อ

### Features ที่อาจเพิ่มในอนาคต:
1. **Filtering**: กรองข้อมูลตาม sale_person
2. **Export**: Export รายงานรายรับเป็น Excel/PDF
3. **Charts**: แสดงกราฟรายรับแยกตามทีม
4. **Comparison**: เปรียบเทียบรายรับเดือนก่อนหน้า
5. **Real-time updates**: ใช้ WebSocket แทน polling

---

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Railway logs
2. ตรวจสอบ Vercel deployment logs
3. เช็ค Browser console สำหรับ errors
4. ตรวจสอบ Network tab ใน DevTools

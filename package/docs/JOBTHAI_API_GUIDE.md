# วิธีการดึงข้อมูลตำแหน่งงานจาก JobThai

## ภาพรวม

JobThai ไม่มี Public API ที่เปิดให้ใช้งานโดยตรง ดังนั้นมีวิธีการหลายแบบในการดึงข้อมูล:

## วิธีที่ 1: Manual Update (แนะนำสำหรับเริ่มต้น) ⭐

### ขั้นตอน:

1. เข้าไปที่ https://www.jobthai.com/th/company/135063
2. คัดลอกข้อมูลตำแหน่งงานที่เปิดรับสมัคร
3. อัพเดทข้อมูลใน `src/app/api/jobs/route.ts` ในส่วน `JOBS_DATA`

### ตัวอย่างโครงสร้างข้อมูล:

```typescript
{
  id: 'รหัสงานจาก JobThai',
  title: 'ชื่อตำแหน่งงาน',
  location: 'สถานที่',
  salary: 'เงินเดือน',
  type: 'งานประจำ',
  category: 'หมวดหมู่',
  postedDate: 'วันที่ประกาศ',
  isUrgent: false,
  hasOnlineInterview: false,
  jobthaiUrl: 'https://www.jobthai.com/th/job/XXXXX',
  description: 'รายละเอียดงาน'
}
```

## วิธีที่ 2: JobThai RSS Feed (ถ้ามี)

JobThai อาจมี RSS Feed สำหรับแต่ละบริษัท คุณสามารถตรวจสอบได้โดย:

```bash
# ลองเข้า URL แบบนี้
https://www.jobthai.com/th/company/135063/rss
https://www.jobthai.com/rss/company/135063
```

หากมี RSS Feed คุณสามารถใช้ library เช่น `rss-parser` เพื่ออ่านข้อมูล:

```bash
npm install rss-parser
```

```typescript
// src/app/api/jobs/rss-fetch.ts
import Parser from "rss-parser";

const parser = new Parser();

export async function fetchJobsFromRSS() {
  try {
    const feed = await parser.parseURL("URL_ของ_RSS_Feed");
    return feed.items.map((item) => ({
      id: extractIdFromUrl(item.link),
      title: item.title,
      // ... map ข้อมูลอื่นๆ
    }));
  } catch (error) {
    console.error("RSS fetch error:", error);
    return [];
  }
}
```

## วิธีที่ 3: Web Scraping (ระวังเรื่อง Terms of Service)

⚠️ **คำเตือน**: ตรวจสอบ Terms of Service ของ JobThai ก่อนใช้วิธีนี้

### ใช้ Puppeteer หรือ Cheerio:

```bash
npm install puppeteer cheerio axios
```

```typescript
// src/lib/scraper.ts
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeJobThai() {
  try {
    const { data } = await axios.get(
      "https://www.jobthai.com/th/company/135063"
    );
    const $ = cheerio.load(data);

    const jobs: any[] = [];

    // ตัวอย่าง selector (ต้องปรับตามโครงสร้างจริงของเว็บ)
    $(".job-item").each((index, element) => {
      const title = $(element).find(".job-title").text().trim();
      const location = $(element).find(".job-location").text().trim();
      const salary = $(element).find(".job-salary").text().trim();
      const link = $(element).find("a").attr("href");

      jobs.push({
        title,
        location,
        salary,
        jobthaiUrl: `https://www.jobthai.com${link}`,
      });
    });

    return jobs;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  }
}
```

## วิธีที่ 4: ติดต่อ JobThai โดยตรง (แนะนำสำหรับระยะยาว) ⭐⭐⭐

ติดต่อ JobThai เพื่อขอ:

- API Access สำหรับดึงข้อมูลตำแหน่งงานของบริษัท
- Widget หรือ Integration ที่ JobThai จัดเตรียมไว้

**ข้อมูลการติดต่อ JobThai:**

- เว็บไซต์: https://www.jobthai.com
- Email: support@jobthai.com
- โทร: 02-480-9999

## วิธีที่ 5: ใช้ Database + Admin Panel

สร้างระบบจัดการตำแหน่งงานเอง:

### 1. เพิ่ม Database Schema:

```sql
CREATE TABLE jobs (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary VARCHAR(100),
  type VARCHAR(50),
  category VARCHAR(100),
  posted_date DATE,
  is_urgent BOOLEAN DEFAULT FALSE,
  has_online_interview BOOLEAN DEFAULT FALSE,
  jobthai_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. สร้าง Admin Panel:

```typescript
// src/app/admin/jobs/page.tsx
"use client";

export default function AdminJobsPage() {
  const handleAddJob = async (jobData: any) => {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    // Handle response
  };

  return (
    <div>
      <h1>จัดการตำแหน่งงาน</h1>
      {/* Form สำหรับเพิ่ม/แก้ไขงาน */}
    </div>
  );
}
```

## วิธีที่ 6: Webhook/Notification System

ถ้า JobThai รองรับ Webhook:

1. ตั้งค่า Webhook endpoint
2. รับการแจ้งเตือนเมื่อมีตำแหน่งงานใหม่
3. อัพเดทข้อมูลอัตโนมัติ

## การอัพเดทข้อมูลอัตโนมัติด้วย Cron Job

ใช้ Vercel Cron Jobs หรือ GitHub Actions:

```yaml
# .github/workflows/update-jobs.yml
name: Update Jobs Data
on:
  schedule:
    - cron: "0 0 * * *" # ทุกวันเวลา 00:00
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Update Jobs
        run: node scripts/update-jobs.js
      - name: Commit changes
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add .
          git commit -m "Update jobs data" || exit 0
          git push
```

## คำแนะนำสุดท้าย

### สำหรับระยะสั้น:

- ใช้วิธีที่ 1 (Manual Update) เพื่อความง่ายและปลอดภัย
- อัพเดทข้อมูลสัปดาห์ละ 1-2 ครั้ง

### สำหรับระยะยาว:

- ติดต่อ JobThai เพื่อขอ API Access (วิธีที่ 4)
- หรือสร้างระบบจัดการงานเอง พร้อม Admin Panel (วิธีที่ 5)

## ตัวอย่างการใช้งาน API

```typescript
// ดึงข้อมูลงานทั้งหมด
const response = await fetch("/api/jobs");
const data = await response.json();

// ค้นหาตำแหน่งงาน
const response = await fetch("/api/jobs?search=วิศวกร");

// กรองตามหมวดหมู่
const response = await fetch("/api/jobs?category=ฝ่ายผลิต");
```

## การรักษาความปลอดภัย

1. **Rate Limiting**: จำกัดจำนวนการ request
2. **Caching**: ใช้ cache เพื่อลด load
3. **Error Handling**: จัดการ error ให้เหมาะสม
4. **Data Validation**: ตรวจสอบข้อมูลก่อนบันทึก

## ไฟล์ที่เกี่ยวข้อง

- `/src/app/api/jobs/route.ts` - API endpoint สำหรับดึงข้อมูลงาน
- `/src/components/Careers/JobListings.tsx` - Component แสดงรายการงาน
- `/src/app/careers/page.tsx` - หน้า Careers หลัก

# คู่มือการใช้งาน API: /api/API-all-log

## 📋 ภาพรวม

API นี้ใช้สำหรับดึงและบันทึกข้อมูล logs ทั้งหมดจากระบบ รวมถึง:

- 📞 Call logs (บันทึกการโทร)
- 👥 Contact logs (บันทึกการติดต่อลูกค้า)
- 🏥 Surgery schedule logs (บันทึกตารางผ่าตัด)
- ⚙️ System logs (บันทึกระบบ)

---

## 🔌 Endpoints

### 1. GET `/api/API-all-log`

ดึงข้อมูล logs ทั้งหมดจากระบบ

#### Query Parameters (ทั้งหมดเป็น optional)

| Parameter   | Type              | Default | คำอธิบาย                                            |
| ----------- | ----------------- | ------- | --------------------------------------------------- |
| `type`      | string            | all     | ชนิดของ log: `call`, `contact`, `surgery`, `system` |
| `startDate` | string (ISO 8601) | -       | วันที่เริ่มต้น (เช่น `2025-01-01`)                  |
| `endDate`   | string (ISO 8601) | -       | วันที่สิ้นสุด (เช่น `2025-12-31`)                   |
| `limit`     | number            | 100     | จำนวน logs สูงสุดที่ต้องการ                         |

#### ตัวอย่างการใช้งาน

**1. ดึง logs ทั้งหมด (100 รายการล่าสุด)**

```bash
GET /api/API-all-log
```

**2. ดึง call logs เท่านั้น**

```bash
GET /api/API-all-log?type=call
```

**3. ดึง logs ในช่วงเวลา**

```bash
GET /api/API-all-log?startDate=2025-11-01&endDate=2025-11-14
```

**4. ดึง surgery logs 50 รายการล่าสุด**

```bash
GET /api/API-all-log?type=surgery&limit=50
```

**5. ดึง contact logs ในเดือนนี้**

```bash
GET /api/API-all-log?type=contact&startDate=2025-11-01&limit=200
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "call-123",
        "timestamp": "2025-11-14T10:30:00Z",
        "type": "call",
        "source": "google-sheets-call-ai",
        "details": {
          "agent_id": "A001",
          "customer_name": "คุณสมชาย",
          "customer_phone": "0812345678",
          "call_duration": "5:30",
          "call_status": "completed",
          "notes": "ติดต่อสำเร็จ"
        }
      },
      {
        "id": "contact-456",
        "timestamp": "2025-11-14T09:15:00Z",
        "type": "contact",
        "source": "customer-contacts",
        "details": {
          "customer_name": "คุณสมหญิง",
          "email": "somying@example.com",
          "phone": "0898765432",
          "message": "สอบถามข้อมูลผลิตภัณฑ์",
          "status": "pending"
        }
      }
    ],
    "total": 2,
    "limit": 100,
    "filters": {
      "type": "all",
      "startDate": null,
      "endDate": null
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Missing Google Sheets credentials"
}
```

---

### 2. POST `/api/API-all-log`

บันทึก log ใหม่เข้าสู่ระบบ

#### Request Body

```json
{
  "type": "call",
  "source": "yalecom-webhook",
  "details": {
    "agent_id": "A001",
    "customer_name": "คุณทดสอบ",
    "customer_phone": "0811111111",
    "call_status": "completed",
    "notes": "ทดสอบบันทึก log"
  }
}
```

#### Required Fields

| Field     | Type   | คำอธิบาย                                            |
| --------- | ------ | --------------------------------------------------- |
| `type`    | string | ชนิดของ log: `call`, `contact`, `surgery`, `system` |
| `source`  | string | แหล่งที่มาของ log                                   |
| `details` | object | รายละเอียดของ log (ขึ้นกับ type)                    |

#### ตัวอย่างการใช้งาน

**1. บันทึก call log**

```bash
curl -X POST https://your-domain.com/api/API-all-log \
  -H "Content-Type: application/json" \
  -d '{
    "type": "call",
    "source": "auto-log-call",
    "details": {
      "agent_id": "A001",
      "customer_phone": "0812345678",
      "call_duration": "3:45",
      "call_status": "completed"
    }
  }'
```

**2. บันทึก contact log**

```bash
curl -X POST https://your-domain.com/api/API-all-log \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact",
    "source": "contact-form",
    "details": {
      "customer_name": "คุณทดสอบ",
      "email": "test@example.com",
      "message": "ข้อความทดสอบ"
    }
  }'
```

**3. บันทึก surgery log**

```bash
curl -X POST https://your-domain.com/api/API-all-log \
  -H "Content-Type: application/json" \
  -d '{
    "type": "surgery",
    "source": "surgery-schedule-webhook",
    "details": {
      "patient_name": "คนไข้ทดสอบ",
      "surgery_date": "2025-11-20",
      "surgery_type": "ผ่าตัดทั่วไป",
      "doctor": "นพ.สมชาย",
      "status": "scheduled"
    }
  }'
```

#### Response Format

```json
{
  "success": true,
  "message": "Log saved successfully",
  "data": {
    "timestamp": "2025-11-14T10:30:00Z",
    "type": "call",
    "source": "auto-log-call"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Missing required fields: type, source, details"
}
```

---

### 3. OPTIONS `/api/API-all-log`

CORS preflight request

#### Response Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📊 Log Types และ Details Structure

### Call Logs (`type: "call"`)

```json
{
  "agent_id": "string",
  "customer_name": "string",
  "customer_phone": "string",
  "call_duration": "string",
  "call_status": "string",
  "notes": "string"
}
```

### Contact Logs (`type: "contact"`)

```json
{
  "customer_name": "string",
  "email": "string",
  "phone": "string",
  "message": "string",
  "status": "string"
}
```

### Surgery Logs (`type: "surgery"`)

```json
{
  "patient_name": "string",
  "surgery_date": "string",
  "surgery_type": "string",
  "doctor": "string",
  "status": "string"
}
```

### System Logs (`type: "system"`)

```json
{
  "event": "string",
  "severity": "info|warning|error",
  "message": "string",
  "metadata": {}
}
```

---

## 🔧 การตั้งค่า Environment Variables

ต้องตั้งค่าตัวแปรต่อไปนี้ใน environment:

```bash
GOOGLE_SA_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

---

## 📝 Google Sheets Structure

### Sheet: "all-logs"

| Column A  | Column B | Column C | Column D       | Column E |
| --------- | -------- | -------- | -------------- | -------- |
| Timestamp | Type     | Source   | Details (JSON) | Status   |

### ตัวอย่างข้อมูล

```
2025-11-14T10:30:00Z | call | google-sheets-call-ai | {"agent_id":"A001",...} | pending
2025-11-14T09:15:00Z | contact | customer-contacts | {"customer_name":"..."} | completed
```

---

## 🔍 Use Cases

### 1. Dashboard แสดง Logs แบบ Real-time

```javascript
// ดึง logs ทุก 30 วินาที
setInterval(async () => {
  const response = await fetch("/api/API-all-log?limit=20");
  const data = await response.json();
  updateDashboard(data.logs);
}, 30000);
```

### 2. รายงาน Call Summary รายวัน

```javascript
const today = new Date().toISOString().split("T")[0];
const response = await fetch(
  `/api/API-all-log?type=call&startDate=${today}&limit=1000`
);
const data = await response.json();
generateReport(data.logs);
```

### 3. Filter Logs ตามประเภท

```javascript
// ดึงเฉพาะ surgery logs
const response = await fetch("/api/API-all-log?type=surgery&limit=50");
const data = await response.json();
displaySurgeryLogs(data.logs);
```

### 4. บันทึก Log อัตโนมัติจาก Webhook

```javascript
// เมื่อมี webhook เข้ามา
app.post("/webhook/call-completed", async (req, res) => {
  await fetch("/api/API-all-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "call",
      source: "yalecom-webhook",
      details: req.body,
    }),
  });
  res.json({ success: true });
});
```

---

## ⚠️ ข้อควรระวัง

1. **Rate Limiting**: Google Sheets API มีข้อจำกัดจำนวนครั้งในการเรียกใช้
2. **Data Size**: ใช้ `limit` parameter เพื่อจำกัดข้อมูลที่ดึงมา
3. **Authentication**: ตรวจสอบให้แน่ใจว่า Service Account มีสิทธิ์เข้าถึง Google Sheet
4. **Error Handling**: ควรมี try-catch เพื่อจัดการ errors

---

## 🚀 Next.js Frontend Example

```typescript
// app/logs-dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function LogsDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/API-all-log?limit=100"
        : `/api/API-all-log?type=${filter}&limit=100`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      setLogs(data.data.logs);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Logs</h1>

      {/* Filter Buttons */}
      <div className="mb-4 space-x-2">
        {["all", "call", "contact", "surgery", "system"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded ${
              filter === type ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Timestamp</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Source</th>
              <th className="border px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id}>
                <td className="border px-4 py-2">
                  {new Date(log.timestamp).toLocaleString("th-TH")}
                </td>
                <td className="border px-4 py-2">{log.type}</td>
                <td className="border px-4 py-2">{log.source}</td>
                <td className="border px-4 py-2">
                  <pre className="text-xs">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## 📞 ติดต่อสอบถาม

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนาระบบ

**Created:** 14 พฤศจิกายน 2025

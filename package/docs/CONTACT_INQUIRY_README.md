# หน้า Contact Inquiry (ติดต่อเรา)

## ภาพรวม

หน้า Contact Inquiry เป็นหน้าที่ออกแบบมาเพื่อให้ลูกค้าสามารถติดต่อบริษัทได้อย่างสะดวก พร้อมด้วย:

✅ **แผนที่ Google Maps** แสดงตำแหน่งสำนักงานใหญ่และโรงงาน  
✅ **ข้อมูลติดต่อ** โทรศัพท์ อีเมล ที่อยู่ เวลาทำการ  
✅ **แบบฟอร์มติดต่อ** ออกแบบให้สวยงามและใช้งานง่าย  
✅ **Responsive Design** ใช้งานได้ดีทุกอุปกรณ์  
✅ **Animation** ด้วย Framer Motion

## ฟีเจอร์หลัก

### 1. ข้อมูลสถานที่ 2 แห่ง

- **สำนักงานใหญ่** - ปทุมธานี
- **โรงงาน** - สมุทรปราการ

สามารถสลับระหว่างสองสถานที่ได้ผ่านแท็บ

### 2. Google Maps Integration

- แสดงตำแหน่งบนแผนที่แบบ interactive
- ลิงก์ไปยัง Google Maps เพื่อดูเส้นทาง
- รองรับทั้งพิกัดและที่อยู่

### 3. แบบฟอร์มติดต่อ

ฟิลด์ที่มี:

- ชื่อ-นามสกุล (Required)
- บริษัท/องค์กร (Optional)
- อีเมล (Required)
- เบอร์โทรศัพท์ (Required)
- หัวข้อ (Required)
- ข้อความ (Required)

### 4. UX/UI Features

- ✅ Form validation
- ✅ Loading state ขณะส่งข้อมูล
- ✅ Success/Error message
- ✅ Icon สวยงามจาก Lucide React
- ✅ Gradient backgrounds
- ✅ Smooth animations
- ✅ Hover effects

## โครงสร้างไฟล์

```
src/app/contact-inquiry/
└── page.tsx          # หน้า Contact Inquiry (Client Component)

docs/
└── GOOGLE_MAPS_SETUP.md   # คู่มือตั้งค่า Google Maps API

.env.example          # ตัวอย่างไฟล์ environment variables
```

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies (มีอยู่แล้ว)

```bash
npm install framer-motion lucide-react
```

### 2. ตั้งค่า Google Maps API

ดูรายละเอียดใน [docs/GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)

สรุปขั้นตอน:

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เปิดใช้งาน Maps Embed API
3. สร้าง API Key
4. สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. อัพเดทพิกัดสถานที่

แก้ไขใน `src/app/contact-inquiry/page.tsx`:

```typescript
const COMPANY_INFO = {
  headquarters: {
    // ...
    coordinates: { lat: 13.9952, lng: 100.6405 }, // พิกัดจริง
  },
  factory: {
    // ...
    coordinates: { lat: 13.6425, lng: 100.7328 }, // พิกัดจริง
  },
};
```

**วิธีหาพิกัด:**

1. เปิด Google Maps
2. คลิกขวาที่ตำแหน่งที่ต้องการ
3. คลิกที่ตัวเลขพิกัด (จะคัดลอกอัตโนมัติ)

### 4. เชื่อมต่อกับ Backend API (TODO)

ปัจจุบันฟอร์มใช้ mock API ในการส่งข้อมูล สามารถแก้ไขฟังก์ชัน `handleSubmit` ใน `page.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // เชื่อมต่อกับ API จริง
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Failed to send");

    setSubmitStatus({
      type: "success",
      message: "ส่งข้อความสำเร็จ!",
    });
  } catch (error) {
    setSubmitStatus({
      type: "error",
      message: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

## การสร้าง Backend API (แนะนำ)

### Option 1: Next.js API Route

สร้าง `src/app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 1. Validate ข้อมูล
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. ส่งอีเมล (ใช้ Nodemailer, SendGrid, etc.)
    // await sendEmail(data);

    // 3. บันทึกลง Database (ถ้าต้องการ)
    // await saveToDatabase(data);

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความสำเร็จ",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Option 2: ส่งอีเมลด้วย Nodemailer

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: "marketingcenter@tpppack.com",
  subject: `ติดต่อใหม่: ${data.subject}`,
  html: `
    <h2>มีผู้ติดต่อใหม่</h2>
    <p><strong>ชื่อ:</strong> ${data.name}</p>
    <p><strong>บริษัท:</strong> ${data.company || "-"}</p>
    <p><strong>อีเมล:</strong> ${data.email}</p>
    <p><strong>โทร:</strong> ${data.phone}</p>
    <p><strong>หัวข้อ:</strong> ${data.subject}</p>
    <p><strong>ข้อความ:</strong></p>
    <p>${data.message}</p>
  `,
});
```

### Option 3: ใช้ SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: "marketingcenter@tpppack.com",
  from: process.env.EMAIL_FROM!,
  subject: `ติดต่อใหม่: ${data.subject}`,
  html: `...`,
});
```

## Customization

### เปลี่ยนสี Theme

แก้ไข Gradient และสีต่างๆ:

```typescript
// Primary Gradient
className = "bg-gradient-to-r from-blue-600 to-emerald-600";

// เปลี่ยนเป็น
className = "bg-gradient-to-r from-red-600 to-orange-600";
```

### ปรับ Animation

แก้ไข variants ใน Framer Motion:

```typescript
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }, // ปรับความเร็ว
  },
};
```

### เพิ่มฟิลด์ในฟอร์ม

1. เพิ่มใน interface:

```typescript
interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  department: string; // ← เพิ่ม
}
```

2. เพิ่ม state:

```typescript
const [formData, setFormData] = useState<FormData>({
  // ...
  department: "",
});
```

3. เพิ่ม input field ในฟอร์ม

## SEO

เพิ่ม metadata ใน `page.tsx`:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อบริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)",
};
```

## Performance Tips

1. **Lazy Load Google Maps**: โหลดเมื่อจำเป็น
2. **Optimize Images**: ใช้ Next.js Image component
3. **Reduce Animation**: ลด motion สำหรับ mobile
4. **Cache API Key**: เก็บใน environment variable

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Focus states
- ✅ ARIA labels (ถ้าต้องการเพิ่ม)

## Testing

### Manual Testing Checklist

- [ ] ฟอร์มส่งได้สำเร็จ
- [ ] Validation ทำงานถูกต้อง
- [ ] แผนที่แสดงผลถูกต้อง
- [ ] สลับแท็บระหว่างสำนักงานและโรงงาน
- [ ] ลิงก์ Google Maps ใช้งานได้
- [ ] Responsive บนหน้าจอต่างๆ
- [ ] Animation smooth ไม่กระตุก

## Known Issues & Limitations

- Google Maps ต้องมี API Key
- ฟอร์มยังไม่เชื่อมต่อกับ backend จริง (ต้องทำเอง)
- ไม่มี reCAPTCHA (แนะนำให้เพิ่มเพื่อป้องกัน spam)

## Next Steps

1. ✅ ตั้งค่า Google Maps API
2. ⏳ สร้าง Backend API สำหรับรับข้อมูล
3. ⏳ ตั้งค่าส่งอีเมล (Nodemailer/SendGrid)
4. ⏳ เพิ่ม reCAPTCHA v3
5. ⏳ เพิ่มฟีเจอร์แนบไฟล์
6. ⏳ บันทึกข้อมูลลง Database

## ติดต่อสอบถาม

หากมีปัญหาหรือข้อสงสัย สามารถติดต่อทีมพัฒนาได้

---

**สร้างโดย**: GitHub Copilot  
**อัพเดทล่าสุด**: 14 ตุลาคม 2568  
**Version**: 1.0.0

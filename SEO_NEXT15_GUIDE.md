# ⚠️ การแก้ไข SEO สำหรับ Next.js 15

## ปัญหาที่พบ

- ❌ `next-seo` ไม่รองรับ Next.js 15 App Router
- ❌ Error: Element type is invalid

## ✅ แก้ไขแล้ว

### Next.js 15 App Router ใช้ Metadata API แทน next-seo

ตอนนี้ SEO ทั้งหมดถูกจัดการโดย:

- **`metadata` export** ใน `layout.tsx` (มีอยู่แล้ว ✅)
- **Schema JSON-LD** ใน `<head>` (มีอยู่แล้ว ✅)

### ไฟล์ที่แก้ไขแล้ว:

1. ✅ `src/components/SEO/DefaultSEO.tsx` - เปลี่ยนเป็น return null
2. ✅ `src/components/SEO/PageSEO.tsx` - ใช้ Head component แทน
3. ✅ `src/app/layout.tsx` - ลบ DefaultSEO component

---

## 🎯 วิธีใช้ SEO ใน Next.js 15

### สำหรับหน้าแรก (Root Layout)

ใช้ `metadata` export ที่มีอยู่แล้วใน `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: {
    default: "BJH Bangkok | Thai Packaging & Printing",
    template: "%s | BJH Bangkok",
  },
  description: "BJH Bangkok (บีเจเอช แบงค็อก) - ผู้นำด้านบรรจุภัณฑ์...",
  keywords: ["BJH Bangkok", "บีเจเอช แบงค็อก", ...],
  // ... (มีอยู่แล้วครบ)
};
```

### สำหรับแต่ละหน้า (Page Level)

เพิ่ม `metadata` export ในแต่ละ page.tsx:

**ตัวอย่าง: `src/app/about/page.tsx`**

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "ประวัติและวิสัยทัศน์ของ BJH Bangkok",
  keywords: ["BJH Bangkok", "เกี่ยวกับ", "ประวัติ"],
  openGraph: {
    title: "เกี่ยวกับ BJH Bangkok",
    description: "ประวัติและวิสัยทัศน์ของบริษัท",
    url: "https://app.bjhbangkok.com/about",
  },
};

export default function AboutPage() {
  return (
    <div>
      <h1>เกี่ยวกับ BJH Bangkok</h1>
      {/* เนื้อหา */}
    </div>
  );
}
```

### สำหรับ Dynamic Routes

**ตัวอย่าง: `src/app/news/[slug]/page.tsx`**

```tsx
import { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.description,
    keywords: ["BJH Bangkok", "ข่าวสาร", post.category],
    openGraph: {
      title: post.title,
      description: post.description,
      images: [{ url: post.image }],
    },
  };
}

export default function NewsPage({ params }) {
  return <article>...</article>;
}
```

---

## 📝 เพิ่ม Schema JSON-LD

### ในหน้าต่างๆ เพิ่ม Schema:

**ตัวอย่าง: หน้าข่าวสาร**

```tsx
import { createArticleSchema } from "@/lib/seo.config";

export default function NewsDetailPage({ params }) {
  const article = {
    title: "ข่าวสารล่าสุด",
    description: "รายละเอียด...",
    image: "https://app.bjhbangkok.com/news.jpg",
    datePublished: "2024-11-25",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createArticleSchema(article)),
        }}
      />

      <article>
        <h1>{article.title}</h1>
        {/* เนื้อหา */}
      </article>
    </>
  );
}
```

---

## ✅ SEO ที่มีอยู่แล้ว (ทำงานปกติ)

### ใน `src/app/layout.tsx`:

1. ✅ **Metadata Export** - Title, Description, Keywords
2. ✅ **Open Graph** - สำหรับ Social Media
3. ✅ **Twitter Card** - สำหรับ Twitter/X
4. ✅ **Organization Schema** - ข้อมูลบริษัท
5. ✅ **LocalBusiness Schema** - การค้นหาในพื้นที่
6. ✅ **Google Site Verification**
7. ✅ **Canonical URL**
8. ✅ **Icons** (favicon, apple-touch-icon)

---

## 🚀 ตัวอย่างการใช้งาน

### 1. หน้า About

สร้างไฟล์ `src/app/about/page.tsx`:

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับ BJH Bangkok",
  description:
    "BJH Bangkok ก่อตั้งขึ้นเมื่อปี 1991 ด้วยวิสัยทัศน์ในการเป็นผู้นำด้านบรรจุภัณฑ์และงานพิมพ์",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div>
      <h1>เกี่ยวกับ BJH Bangkok</h1>
      <p>BJH Bangkok เป็นบริษัทชั้นนำ...</p>
    </div>
  );
}
```

### 2. หน้า Contact

สร้างไฟล์ `src/app/contact/page.tsx`:

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อ BJH Bangkok",
  description: "ติดต่อ BJH Bangkok - โทร 02-xxx-xxxx หรือ info@bjhbangkok.com",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div>
      <h1>ติดต่อ BJH Bangkok</h1>
      {/* ฟอร์มติดต่อ */}
    </div>
  );
}
```

### 3. หน้า Products

สร้างไฟล์ `src/app/products/page.tsx`:

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผลิตภัณฑ์ - BJH Bangkok",
  description: "ผลิตภัณฑ์บรรจุภัณฑ์และงานพิมพ์คุณภาพสูงจาก BJH Bangkok",
  keywords: [
    "BJH Bangkok",
    "ผลิตภัณฑ์",
    "บรรจุภัณฑ์",
    "งานพิมพ์",
    "กล่องกระดาษ",
  ],
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  return (
    <div>
      <h1>ผลิตภัณฑ์ BJH Bangkok</h1>
      {/* รายการผลิตภัณฑ์ */}
    </div>
  );
}
```

---

## 📊 ตรวจสอบ SEO

### 1. View Page Source

- เปิดเว็บไซต์
- กด `Ctrl+U` (View Source)
- ค้นหา "BJH Bangkok"
- ตรวจสอบ meta tags และ Schema

### 2. Google Rich Results Test

- ไปที่: https://search.google.com/test/rich-results
- ใส่: `https://app.bjhbangkok.com`
- ตรวจสอบว่า Schema ถูกต้อง

### 3. Facebook Debugger

- ไปที่: https://developers.facebook.com/tools/debug/
- ใส่ URL
- ตรวจสอบ Open Graph

---

## 🎯 สรุป

### ทำงานแล้ว (ไม่ต้องแก้):

- ✅ Metadata ใน layout.tsx
- ✅ Open Graph
- ✅ Twitter Card
- ✅ Schema JSON-LD (Organization, LocalBusiness)
- ✅ Google Site Verification
- ✅ Sitemap (next-sitemap.config.js)
- ✅ robots.txt

### ที่ต้องทำ (Optional):

- เพิ่ม metadata ในแต่ละหน้า (about, contact, products, etc.)
- เพิ่ม Schema JSON-LD เฉพาะหน้า (Article, Product, FAQ)

---

## 📚 อ้างอิง

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org](https://schema.org/)

---

**หมายเหตุ:**

- Components ใน `src/components/SEO/` เก็บไว้เผื่อใช้ในอนาคต
- ตอนนี้ใช้ Metadata API ของ Next.js 15 แทน
- SEO ทำงานปกติโดยไม่ต้องใช้ next-seo library

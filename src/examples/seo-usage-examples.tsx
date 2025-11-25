/**
 * ตัวอย่างการใช้งาน SEO สำหรับ Next.js 15 App Router
 *
 * หมายเหตุ: ไฟล์นี้เป็นเพียงตัวอย่างโค้ด ไม่ได้ใช้งานจริง
 * สำหรับคำแนะนำการใช้งานจริง ดูที่: SEO_NEXT15_GUIDE.md
 */

import { Metadata } from "next";
import {
  createBreadcrumbSchema,
  createArticleSchema,
  createProductSchema,
  createFAQSchema,
} from "@/lib/seo.config";

// ============================================
// ตัวอย่างที่ 1: หน้า About (src/app/about/page.tsx)
// ============================================

export const aboutMetadata: Metadata = {
  title: "เกี่ยวกับเรา - ประวัติและวิสัยทัศน์",
  description:
    "BJH Bangkok มีประวัติกว่า 30 ปี ในการให้บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "เกี่ยวกับ BJH Bangkok",
    description: "ผู้นำด้านบรรจุภัณฑ์และการพิมพ์ในประเทศไทย",
    url: "https://app.bjhbangkok.com/about",
    images: [
      {
        url: "https://app.bjhbangkok.com/images/about-banner.jpg",
        width: 1200,
        height: 630,
        alt: "BJH Bangkok Office",
      },
    ],
  },
};

export function AboutPageExample() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: "เกี่ยวกับเรา", url: "/about" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <h1>เกี่ยวกับ BJH Bangkok</h1>
      <p>เนื้อหาหน้า About...</p>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 2: หน้า Contact (src/app/contact/page.tsx)
// ============================================

export const contactMetadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อ BJH Bangkok - โทร 02-xxx-xxxx หรือ info@bjhbangkok.com",
  alternates: {
    canonical: "/contact",
  },
};

export function ContactPageExample() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "ติดต่อเรา - BJH Bangkok",
    description: "ช่องทางการติดต่อ BJH Bangkok",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <h1>ติดต่อเรา</h1>
      {/* ฟอร์มติดต่อ */}
    </>
  );
}

// ============================================
// ตัวอย่างที่ 3: หน้าข่าวสาร List (src/app/news/page.tsx)
// ============================================

export const newsListMetadata: Metadata = {
  title: "ข่าวสารและกิจกรรม",
  description: "ติดตามข่าวสารและกิจกรรมล่าสุดของ BJH Bangkok",
  alternates: {
    canonical: "/news",
  },
  openGraph: {
    type: "website",
    title: "ข่าวสารและกิจกรรม BJH Bangkok",
  },
};

export function NewsListPageExample() {
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ข่าวสารและกิจกรรม",
    description: "ข่าวสารและกิจกรรมล่าสุดจาก BJH Bangkok",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <h1>ข่าวสารและกิจกรรม</h1>
      {/* รายการข่าว */}
    </>
  );
}

// ============================================
// ตัวอย่างที่ 4: หน้าข่าวสาร Detail (src/app/news/[slug]/page.tsx)
// ============================================

export function NewsDetailPageExample() {
  // ข้อมูลตัวอย่าง
  const article = {
    title: "BJH Bangkok เปิดตัวบรรจุภัณฑ์รักษ์โลกรุ่นใหม่",
    description: "บริษัทเปิดตัวบรรจุภัณฑ์เพื่อสิ่งแวดล้อม 100% biodegradable",
    image: "https://app.bjhbangkok.com/images/news/eco-packaging.jpg",
    datePublished: "2024-11-25",
    dateModified: "2024-11-25",
  };

  const articleSchema = createArticleSchema(article);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: "ข่าวสาร", url: "/news" },
    { name: article.title, url: "/news/eco-packaging" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <article>
        <h1>{article.title}</h1>
        <time dateTime={article.datePublished}>
          {new Date(article.datePublished).toLocaleDateString("th-TH")}
        </time>
        <p>{article.description}</p>
      </article>
    </>
  );
}

// Metadata สำหรับ Dynamic Route
export async function generateNewsDetailMetadata(
  slug: string
): Promise<Metadata> {
  // ในการใช้งานจริง ดึงข้อมูลจาก API/Database
  const article = {
    title: "BJH Bangkok เปิดตัวบรรจุภัณฑ์รักษ์โลกรุ่นใหม่",
    description: "บริษัทเปิดตัวบรรจุภัณฑ์เพื่อสิ่งแวดล้อม 100% biodegradable",
    image: "https://app.bjhbangkok.com/images/news/eco-packaging.jpg",
  };

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/news/${slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      images: [{ url: article.image }],
    },
  };
}

// ============================================
// ตัวอย่างที่ 5: หน้าผลิตภัณฑ์ (src/app/products/[id]/page.tsx)
// ============================================

export function ProductDetailPageExample() {
  const product = {
    name: "กล่องกระดาษลูกฟูก Premium",
    description: "กล่องกระดาษลูกฟูกคุณภาพสูง ทนทาน กันกระแทก",
    image: "https://app.bjhbangkok.com/images/products/corrugated-box.jpg",
  };

  const productSchema = createProductSchema(product);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: "ผลิตภัณฑ์", url: "/products" },
    { name: product.name, url: "/products/corrugated-box" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div>
        <h1>{product.name}</h1>
        <img src={product.image} alt={product.name} />
        <p>{product.description}</p>
      </div>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 6: หน้า FAQ (src/app/faq/page.tsx)
// ============================================

export const faqMetadata: Metadata = {
  title: "คำถามที่พบบ่อย (FAQ)",
  description: "คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับ BJH Bangkok",
  alternates: {
    canonical: "/faq",
  },
};

export function FAQPageExample() {
  const faqs = [
    {
      question: "BJH Bangkok ให้บริการด้านอะไรบ้าง?",
      answer: "เราให้บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง",
    },
    {
      question: "ระยะเวลาในการผลิตเท่าไหร่?",
      answer:
        "ระยะเวลาการผลิตขึ้นอยู่กับประเภทและปริมาณสินค้า โดยทั่วไปใช้เวลา 7-14 วันทำการ",
    },
    {
      question: "มีขั้นต่ำในการสั่งซื้อหรือไม่?",
      answer: "มีขั้นต่ำในการสั่งซื้อตามประเภทผลิตภัณฑ์ กรุณาติดต่อฝ่ายขาย",
    },
  ];

  const faqSchema = createFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div>
        <h1>คำถามที่พบบ่อย (FAQ)</h1>
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 7: หน้า Services (src/app/services/page.tsx)
// ============================================

export const servicesMetadata: Metadata = {
  title: "บริการของเรา",
  description: "บริการด้านบรรจุภัณฑ์และการพิมพ์ครบวงจร จาก BJH Bangkok",
  alternates: {
    canonical: "/services",
  },
};

export function ServicesPageExample() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Packaging and Printing Solutions",
    provider: {
      "@type": "Organization",
      name: "BJH Bangkok",
      url: "https://app.bjhbangkok.com",
    },
    areaServed: {
      "@type": "Country",
      name: "Thailand",
    },
    description: "บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <h1>บริการของเรา</h1>
      <p>บริการครบวงจรด้านบรรจุภัณฑ์และการพิมพ์...</p>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 8: Blog Post (src/app/blog/[slug]/page.tsx)
// ============================================

export function BlogPostPageExample() {
  const post = {
    title: "5 เทรนด์บรรจุภัณฑ์ที่ต้องจับตามองในปี 2025",
    description: "เทรนด์บรรจุภัณฑ์ล่าสุดที่จะเปลี่ยนโฉมหน้าอุตสาหกรรม",
    image: "https://app.bjhbangkok.com/images/blog/trends-2025.jpg",
    datePublished: "2024-11-20",
    author: "BJH Bangkok Marketing Team",
  };

  const articleSchema = createArticleSchema({
    ...post,
    author: post.author,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article>
        <h1>{post.title}</h1>
        <p className="author">โดย {post.author}</p>
        <p>{post.description}</p>
      </article>
    </>
  );
}

/**
 * สรุปวิธีใช้งาน:
 *
 * 1. สร้างไฟล์ page.tsx ในแต่ละ route
 * 2. Export metadata สำหรับ SEO
 * 3. เพิ่ม Schema JSON-LD ในหน้าที่ต้องการ
 * 4. ใช้ helper functions จาก seo.config.ts
 *
 * ดูรายละเอียดเพิ่มเติมใน: SEO_NEXT15_GUIDE.md
 */

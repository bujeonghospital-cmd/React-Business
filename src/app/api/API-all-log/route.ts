import { NextRequest, NextResponse } from "next/server";
/**
 * API สำหรับแสดงรายการ Paths ทั้งหมดในโปรเจ็ค
 * เมื่อเข้า http://localhost:3000/api/API-all-log
 * จะแสดงรายการ paths ทั้งหมดที่มีในโปรเจ็ค
 */
interface PathInfo {
  path: string;
  type: "page" | "api" | "fullscreen";
  category: string;
  description: string;
}
export async function GET(request: NextRequest) {
  try {
    // รายการ paths ทั้งหมดในโปรเจ็ค
    const allPaths: PathInfo[] = [
      // Frontend Pages - หน้าแรกและข้อมูลบริษัท
      { path: "/", type: "page", category: "หน้าหลัก", description: "หน้าแรก" },
      {
        path: "/about-philosophy",
        type: "page",
        category: "หน้าหลัก",
        description: "ปรัชญาองค์กร",
      },
      {
        path: "/about-history",
        type: "page",
        category: "หน้าหลัก",
        description: "ประวัติบริษัท",
      },
      {
        path: "/about-executives",
        type: "page",
        category: "หน้าหลัก",
        description: "ผู้บริหาร",
      },
      {
        path: "/about-subsidiaries",
        type: "page",
        category: "หน้าหลัก",
        description: "บริษัทในเครือ",
      },
      // ผลิตภัณฑ์และบริการ
      {
        path: "/our-services",
        type: "page",
        category: "ผลิตภัณฑ์และบริการ",
        description: "บริการของเรา",
      },
      {
        path: "/our-customers",
        type: "page",
        category: "ผลิตภัณฑ์และบริการ",
        description: "ลูกค้าของเรา",
      },
      {
        path: "/products-pakku-packaging",
        type: "page",
        category: "ผลิตภัณฑ์และบริการ",
        description: "ผลิตภัณฑ์บรรจุภัณฑ์",
      },
      {
        path: "/products-pakku-packaging/[id]",
        type: "page",
        category: "ผลิตภัณฑ์และบริการ",
        description: "รายละเอียดผลิตภัณฑ์",
      },
      // โรงงานและคุณภาพ
      {
        path: "/factory-technology",
        type: "page",
        category: "โรงงานและคุณภาพ",
        description: "เทคโนโลยีโรงงาน",
      },
      {
        path: "/quality-control",
        type: "page",
        category: "โรงงานและคุณภาพ",
        description: "การควบคุมคุณภาพ",
      },
      {
        path: "/quality-certification",
        type: "page",
        category: "โรงงานและคุณภาพ",
        description: "ใบรับรองมาตรฐาน",
      },
      // นักลงทุนสัมพันธ์
      {
        path: "/investor-stock-price",
        type: "page",
        category: "นักลงทุนสัมพันธ์",
        description: "ราคาหุ้น",
      },
      {
        path: "/investor-financials",
        type: "page",
        category: "นักลงทุนสัมพันธ์",
        description: "ข้อมูลทางการเงิน",
      },
      {
        path: "/investor-governance",
        type: "page",
        category: "นักลงทุนสัมพันธ์",
        description: "การกำกับดูแลกิจการ",
      },
      {
        path: "/investor-shareholders",
        type: "page",
        category: "นักลงทุนสัมพันธ์",
        description: "ข้อมูลผู้ถือหุ้น",
      },
      {
        path: "/investor-downloads",
        type: "page",
        category: "นักลงทุนสัมพันธ์",
        description: "ดาวน์โหลดเอกสาร",
      },
      {
        path: "/investor-contact",
        type: "page",
        category: "นักลงทุนสัมพันธ์",
        description: "ติดต่อนักลงทุนสัมพันธ์",
      },
      // ข่าวสารและกิจกรรม
      {
        path: "/news-events",
        type: "page",
        category: "ข่าวสาร",
        description: "ข่าวสารและกิจกรรม",
      },
      {
        path: "/articles",
        type: "page",
        category: "ข่าวสาร",
        description: "บทความ",
      },
      {
        path: "/tpp-news",
        type: "page",
        category: "ข่าวสาร",
        description: "ข่าว TPP",
      },
      {
        path: "/awards-achievements",
        type: "page",
        category: "ข่าวสาร",
        description: "รางวัลและความสำเร็จ",
      },
      // การตลาดและโฆษณา
      {
        path: "/facebook-ads-dashboard",
        type: "page",
        category: "การตลาด",
        description: "Dashboard Facebook Ads",
      },
      {
        path: "/facebook-ads-insights",
        type: "page",
        category: "การตลาด",
        description: "Facebook Ads Insights",
      },
      {
        path: "/facebook-ads-manager",
        type: "page",
        category: "การตลาด",
        description: "Facebook Ads Manager",
      },
      {
        path: "/google-ads-dashboard",
        type: "page",
        category: "การตลาด",
        description: "Dashboard Google Ads",
      },
      // การจัดการลูกค้า
      {
        path: "/contact-dashboard",
        type: "page",
        category: "จัดการลูกค้า",
        description: "Dashboard การติดต่อ",
      },
      {
        path: "/customer-contact-dashboard",
        type: "page",
        category: "จัดการลูกค้า",
        description: "Dashboard ข้อมูลลูกค้า",
      },
      {
        path: "/contact-inquiry",
        type: "page",
        category: "จัดการลูกค้า",
        description: "ฟอร์มติดต่อสอบถาม",
      },
      // อื่นๆ
      {
        path: "/careers",
        type: "page",
        category: "อื่นๆ",
        description: "ร่วมงานกับเรา",
      },
      {
        path: "/go-green",
        type: "page",
        category: "อื่นๆ",
        description: "Go Green Initiative",
      },
      {
        path: "/PDPA",
        type: "page",
        category: "อื่นๆ",
        description: "นโยบายความเป็นส่วนตัว",
      },
      {
        path: "/login",
        type: "page",
        category: "อื่นๆ",
        description: "เข้าสู่ระบบ",
      },
      {
        path: "/oauth2callback",
        type: "page",
        category: "อื่นๆ",
        description: "OAuth callback",
      },
      // Fullscreen Pages
      {
        path: "/customer-all-data",
        type: "fullscreen",
        category: "Fullscreen",
        description: "แสดงข้อมูลลูกค้าทั้งหมด",
      },
      {
        path: "/edit-customer",
        type: "fullscreen",
        category: "Fullscreen",
        description: "แก้ไขข้อมูลลูกค้า",
      },
      {
        path: "/performance-surgery-schedule",
        type: "fullscreen",
        category: "Fullscreen",
        description: "แสดงประสิทธิภาพตารางผ่าตัด",
      },
      // API Routes - การจัดการข้อมูลลูกค้า
      {
        path: "/api/customer-contacts",
        type: "api",
        category: "Customer Data",
        description: "ดึงและสร้างข้อมูลการติดต่อลูกค้า",
      },
      {
        path: "/api/customer-contacts/[id]",
        type: "api",
        category: "Customer Data",
        description: "จัดการข้อมูลลูกค้ารายบุคคล",
      },
      {
        path: "/api/film-contacts",
        type: "api",
        category: "Customer Data",
        description: "ดึงข้อมูล contacts จาก Film system",
      },
      // Google Sheets Integration
      {
        path: "/api/google-sheets-all-data",
        type: "api",
        category: "Google Sheets",
        description: "ดึงข้อมูลทั้งหมดจาก Google Sheets",
      },
      {
        path: "/api/google-sheets-data",
        type: "api",
        category: "Google Sheets",
        description: "ดึงข้อมูลจาก Google Sheets",
      },
      {
        path: "/api/google-sheets-film-data",
        type: "api",
        category: "Google Sheets",
        description: "ดึงข้อมูล Film",
      },
      {
        path: "/api/google-sheets-film-dev",
        type: "api",
        category: "Google Sheets",
        description: "ดึงข้อมูล Film Development",
      },
      {
        path: "/api/google-sheets-film-call-status",
        type: "api",
        category: "Google Sheets",
        description: "ดึงสถานะการโทร Film",
      },
      {
        path: "/api/google-sheets-call-ai",
        type: "api",
        category: "Google Sheets",
        description: "ดึงข้อมูลการโทร AI",
      },
      {
        path: "/api/google-sheets-call-ai-summary",
        type: "api",
        category: "Google Sheets",
        description: "ดึงสรุปการโทร AI",
      },
      {
        path: "/api/google-sheets-log-call-ai",
        type: "api",
        category: "Google Sheets",
        description: "บันทึกและดึง log การโทร AI",
      },
      // Yalecom (โทรศัพท์)
      {
        path: "/api/yalecom/robocall",
        type: "api",
        category: "Yalecom",
        description: "จัดการ Robocall",
      },
      {
        path: "/api/yalecom/contacts",
        type: "api",
        category: "Yalecom",
        description: "จัดการ contacts ใน Yalecom",
      },
      {
        path: "/api/yalecom/queue-status",
        type: "api",
        category: "Yalecom",
        description: "ตรวจสอบสถานะ queue",
      },
      {
        path: "/api/yalecom-queue",
        type: "api",
        category: "Yalecom",
        description: "ดึงข้อมูล queue",
      },
      // Webhooks
      {
        path: "/api/webhooks/yalecom-call",
        type: "api",
        category: "Webhooks",
        description: "Webhook รับข้อมูลการโทรจาก Yalecom",
      },
      {
        path: "/api/webhooks/surgery-schedule",
        type: "api",
        category: "Webhooks",
        description: "Webhook จัดการตารางผ่าตัด",
      },
      // การบันทึกการโทร
      {
        path: "/api/API-all-log",
        type: "api",
        category: "Call Logging",
        description: "✨ แสดงรายการ Paths ทั้งหมด",
      },
      {
        path: "/api/auto-log-call",
        type: "api",
        category: "Call Logging",
        description: "บันทึกการโทรอัตโนมัติ",
      },
      {
        path: "/api/robocall",
        type: "api",
        category: "Call Logging",
        description: "ดึงข้อมูล robocall",
      },
      {
        path: "/api/call-schedule",
        type: "api",
        category: "Call Logging",
        description: "จัดการตารางการโทร",
      },
      {
        path: "/api/call-schedule/call-details",
        type: "api",
        category: "Call Logging",
        description: "ดึงรายละเอียดการโทร",
      },
      {
        path: "/api/call-schedule/daily-summary",
        type: "api",
        category: "Call Logging",
        description: "ดึงสรุปการโทรรายวัน",
      },
      // ตารางผ่าตัด
      {
        path: "/api/surgery-schedule",
        type: "api",
        category: "Surgery",
        description: "ดึงตารางผ่าตัด",
      },
      {
        path: "/api/surgery-schedule-python",
        type: "api",
        category: "Surgery",
        description: "ดึงตารางผ่าตัดจาก Python API",
      },
      // Facebook Ads
      {
        path: "/api/facebook-ads",
        type: "api",
        category: "Facebook Ads",
        description: "ดึงข้อมูลโฆษณา Facebook",
      },
      {
        path: "/api/facebook-ads-simple",
        type: "api",
        category: "Facebook Ads",
        description: "ดึงข้อมูลโฆษณา Facebook (แบบง่าย)",
      },
      {
        path: "/api/facebook-ads-campaigns",
        type: "api",
        category: "Facebook Ads",
        description: "ดึงข้อมูล campaigns",
      },
      {
        path: "/api/facebook-ads-insights",
        type: "api",
        category: "Facebook Ads",
        description: "ดึงข้อมูล insights",
      },
      {
        path: "/api/facebook-ads-mock",
        type: "api",
        category: "Facebook Ads",
        description: "ทดสอบด้วยข้อมูล mock",
      },
      {
        path: "/api/test-facebook",
        type: "api",
        category: "Facebook Ads",
        description: "ทดสอบ Facebook API",
      },
      // Google Ads
      {
        path: "/api/google-ads",
        type: "api",
        category: "Google Ads",
        description: "ดึงข้อมูลโฆษณา Google",
      },
      // Film Data
      {
        path: "/api/film-data",
        type: "api",
        category: "Film Data",
        description: "ดึงข้อมูล Film",
      },
      {
        path: "/api/python-film-dev",
        type: "api",
        category: "Film Data",
        description: "ดึงข้อมูล Film Development จาก Python",
      },
      // อื่นๆ
      {
        path: "/api/jobs",
        type: "api",
        category: "Others",
        description: "จัดการข้อมูลงาน/ตำแหน่ง",
      },
      {
        path: "/api/stock",
        type: "api",
        category: "Others",
        description: "ดึงข้อมูลหุ้น",
      },
      {
        path: "/api/financial-data",
        type: "api",
        category: "Others",
        description: "ดึงข้อมูลทางการเงิน",
      },
      {
        path: "/api/contact",
        type: "api",
        category: "Others",
        description: "รับข้อความติดต่อ",
      },
      {
        path: "/api/check-env",
        type: "api",
        category: "Others",
        description: "ตรวจสอบ environment variables",
      },
      {
        path: "/api/auth/login",
        type: "api",
        category: "Others",
        description: "เข้าสู่ระบบ",
      },
    ];
    // จัดกลุ่มตาม category
    const groupedPaths = allPaths.reduce((acc, path) => {
      if (!acc[path.category]) {
        acc[path.category] = [];
      }
      acc[path.category].push(path);
      return acc;
    }, {} as Record<string, PathInfo[]>);
    // สรุปข้อมูล
    const summary = {
      total: allPaths.length,
      byType: {
        page: allPaths.filter((p) => p.type === "page").length,
        api: allPaths.filter((p) => p.type === "api").length,
        fullscreen: allPaths.filter((p) => p.type === "fullscreen").length,
      },
      categories: Object.keys(groupedPaths).length,
    };
    return NextResponse.json(
      {
        success: true,
        message: "รายการ Paths ทั้งหมดในโปรเจ็ค React-Business",
        summary,
        data: {
          allPaths,
          groupedPaths,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching paths:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch paths",
      },
      { status: 500 }
    );
  }
}
/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
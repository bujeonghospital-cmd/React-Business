import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false, // เปลี่ยนเป็น true ถ้าต้องการ SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
/**
 * GET /api/film-booking-count
 * ดึงจำนวน consult และ surgery bookings แยกตาม agent_id
 * โดยใช้ SQL query พร้อม ORDER BY booking_count DESC
 */
export async function GET(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const today = searchParams.get("today") === "true";
    // กำหนดวันที่สำหรับ query
    let targetDate = date;
    if (today || !targetDate) {
      targetDate = new Date().toISOString().split("T")[0];
    }
    console.log("🔍 Fetching film booking count for date:", targetDate);
    // Agent name mapping (ชื่อเซลล์ -> Agent ID)
    const agentNameMap: Record<string, string> = {
      สา: "101",
      พัดชา: "102",
      ตั้งโอ๋: "103",
      โอ๋: "103",
      Test: "104",
      จีน: "105",
      มุก: "106",
      เจ: "107",
      ว่าน: "108",
    };
    const schema = process.env.DB_SCHEMA || "public";
    const database = process.env.DB_NAME || "postgres";
    // Query สำหรับดึงข้อมูลจาก daily_bookings (มีทั้ง Consult และ Surgery)
    const bookingsQuery = `
      SELECT 
        contact_staff,
        booking_date,
        booking_type,
        booking_count
      FROM ${database}."${schema}".daily_bookings
      WHERE booking_date = $1
      AND contact_staff IS NOT NULL
    `;
    console.log("📝 Executing SQL query...");
    console.log("Schema:", schema);
    console.log("Database:", database);
    console.log("Date:", targetDate);
    // Execute query
    const bookingsResult = await client.query(bookingsQuery, [targetDate]);
    const bookingsData = bookingsResult.rows;
    console.log("📊 Raw data fetched:", {
      totalRows: bookingsData?.length || 0,
      sample: bookingsData?.[0],
    });
    // นับจำนวนและเรียงลำดับตาม booking_count DESC
    const consultCounts: Record<string, number> = {};
    const surgeryCounts: Record<string, number> = {};
    // Helper function: แปลง contact_staff เป็น agent_id
    const getAgentId = (staffName: string): string | null => {
      const trimmedName = staffName.trim();
      // ตรวจสอบว่าตรงกับ mapping ไหม
      if (agentNameMap[trimmedName]) {
        return agentNameMap[trimmedName];
      }
      // ถ้าเป็นตัวเลข 3 หลัก ให้ใช้เลย
      if (/^\d{3}$/.test(trimmedName)) {
        return trimmedName;
      }
      // ลองหาว่ามีตัวเลข 3 หลักในชื่อไหม (เช่น "101-สา")
      const match = trimmedName.match(/^(\d{3})/);
      if (match) {
        return match[1];
      }
      return null;
    };
    // ประมวลผลข้อมูลจาก daily_bookings
    if (Array.isArray(bookingsData)) {
      bookingsData.forEach((row: any) => {
        const agentId = getAgentId(String(row.contact_staff || ""));
        const bookingType = String(row.booking_type || "").trim();
        const bookingCount = parseInt(row.booking_count) || 0;
        if (agentId && bookingCount > 0) {
          if (bookingType === "Consult") {
            consultCounts[agentId] =
              (consultCounts[agentId] || 0) + bookingCount;
          } else if (bookingType === "Surgery") {
            surgeryCounts[agentId] =
              (surgeryCounts[agentId] || 0) + bookingCount;
          }
        }
      });
    }
    // เรียงลำดับตามจำนวน (DESC) - มากไปน้อย
    const sortByCount = (counts: Record<string, number>) => {
      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, number>);
    };
    const sortedConsultCounts = sortByCount(consultCounts);
    const sortedSurgeryCounts = sortByCount(surgeryCounts);
    // คำนวณยอดรวม
    const totalConsults = Object.values(sortedConsultCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalSurgeries = Object.values(sortedSurgeryCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    console.log(
      "✅ Booking count loaded from daily_bookings (ORDER BY DESC):",
      {
        date: targetDate,
        consultCounts: sortedConsultCounts,
        surgeryCounts: sortedSurgeryCounts,
        totalConsults,
        totalSurgeries,
        rawRows: bookingsData?.length || 0,
      }
    );
    return NextResponse.json({
      success: true,
      date: targetDate,
      consultCounts: sortedConsultCounts,
      surgeryCounts: sortedSurgeryCounts,
      summary: {
        totalConsults,
        totalSurgeries,
        totalAgentsWithConsults: Object.keys(sortedConsultCounts).length,
        totalAgentsWithSurgeries: Object.keys(sortedSurgeryCounts).length,
      },
      source: "postgresql_daily_bookings_ordered_by_booking_count_desc",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in film-booking-count API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
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

    // Query สำหรับ consult - ใช้ตาราง bjh_all_leads
    const consultQuery = `
      SELECT 
        contact_staff,
        booked_consult_date
      FROM ${database}."${schema}".bjh_all_leads
      WHERE DATE(booked_consult_date) = $1
      AND contact_staff IS NOT NULL
    `;

    console.log("📝 Executing SQL query...");
    console.log("Schema:", schema);
    console.log("Database:", database);
    console.log("Date:", targetDate);

    // Execute query
    const consultResult = await client.query(consultQuery, [targetDate]);
    const consultData = consultResult.rows;

    console.log("📊 Raw data fetched:", {
      consultRows: consultData?.length || 0,
      consultSample: consultData?.[0],
    });

    // นับจำนวนและเรียงลำดับตาม booking_count DESC
    const consultCounts: Record<string, number> = {};

    // Helper function: แปลง contact_staff เป็น agent_id
    const getAgentId = (row: any): string | null => {
      // ถ้ามี contact_staff ให้แปลง
      if (row.contact_staff) {
        const staffName = String(row.contact_staff).trim();

        // ตรวจสอบว่าตรงกับ mapping ไหม
        if (agentNameMap[staffName]) {
          return agentNameMap[staffName];
        }

        // ถ้าเป็นตัวเลข 3 หลัก ให้ใช้เลย
        if (/^\d{3}$/.test(staffName)) {
          return staffName;
        }

        // ลองหาว่ามีตัวเลข 3 หลักในชื่อไหม (เช่น "101-สา")
        const match = staffName.match(/^(\d{3})/);
        if (match) {
          return match[1];
        }
      }

      return null;
    };

    // นับจำนวน consult แยกตาม agent_id
    if (Array.isArray(consultData)) {
      consultData.forEach((row: any) => {
        const agentId = getAgentId(row);
        if (agentId) {
          consultCounts[agentId] = (consultCounts[agentId] || 0) + 1;
        }
      });
    }

    // เรียงลำดับตามจำนวน (DESC) - มากไปน้อย
    const sortedConsultCounts = Object.entries(consultCounts)
      .sort(([, a], [, b]) => b - a) // เรียงจากมากไปน้อย
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, number>);

    // คำนวณยอดรวม
    const totalConsults = Object.values(sortedConsultCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    console.log("✅ Film booking count loaded from SQL (ORDER BY DESC):", {
      date: targetDate,
      consultCounts: sortedConsultCounts,
      totalConsults,
      rawConsultRows: consultData?.length || 0,
    });

    return NextResponse.json({
      success: true,
      date: targetDate,
      consultCounts: sortedConsultCounts,
      surgeryCounts: {}, // ไม่มีข้อมูล surgery ในตาราง bjh_all_leads
      summary: {
        totalConsults,
        totalSurgeries: 0,
        totalAgentsWithConsults: Object.keys(sortedConsultCounts).length,
        totalAgentsWithSurgeries: 0,
      },
      source: "postgresql_bjh_all_leads_ordered_by_booking_count_desc",
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

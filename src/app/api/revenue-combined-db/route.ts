import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds
/**
 * GET /api/revenue-combined-db
 * ดึงข้อมูลรายรับจาก bjh_all_leads
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const contactPerson = searchParams.get("contact_person");
    // Check cache first
    const cacheKey = `revenue-combined-db-${month || "all"}-${year || "all"}-${
      contactPerson || "all"
    }`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached revenue from database`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }
    console.log(
      `📡 Fetching revenue from bjh_all_leads (from TODAY onwards)...`
    );
    // SQL query ที่ดึงข้อมูลจาก bjh_all_leads ตั้งแต่วันนี้เป็นต้นไป
    let query = `
      SELECT 
        contact_staff,
        surgery_date,
        doctor,
        customer_name,
        phone,
        proposed_amount,
        appointment_time
      FROM postgres."BJH-Server".bjh_all_leads
      WHERE surgery_date IS NOT NULL
        AND surgery_date::date >= CURRENT_DATE
    `;
    const params: any[] = [];
    let paramIndex = 1;
    // Filter by contact person (contact_staff) if provided
    if (contactPerson && contactPerson !== "all") {
      query += ` AND contact_staff = $${paramIndex++}`;
      params.push(contactPerson);
    }
    // Order by surgery_date
    query += ` ORDER BY surgery_date DESC`;
    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      console.log(
        `✅ Successfully fetched ${result.rows.length} revenue records from database (bjh_all_leads - from TODAY onwards)`
      );
      console.log("📊 Sample data:", {
        sampleRows: result.rows.slice(0, 5),
        uniqueContactStaff: [
          ...new Set(result.rows.map((r: any) => r.contact_staff)),
        ],
        filters: {
          contactPerson,
          fromDate: new Date().toISOString().split("T")[0],
        },
      });
      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database (bjh_all_leads - from TODAY onwards)",
        debug: {
          filters: {
            from_date: new Date().toISOString().split("T")[0],
            contact_person: contactPerson || "all",
          },
        },
      };
      // Update cache with expiration time
      cache.set(cacheKey, {
        data: transformedData,
        timestamp: now,
        expiresAt: now + CACHE_DURATION,
      });
      // Clean old cache entries
      for (const [key, value] of cache.entries()) {
        if (now > value.expiresAt + 60000) {
          cache.delete(key);
        }
      }
      return NextResponse.json(transformedData, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "MISS",
          "X-Data-Source": "PostgreSQL Database (Fresh)",
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching revenue combined from database:", error);
    // Return cached data if available even if expired
    const cached = cache.get("revenue-combined-db");
    if (cached) {
      console.log("⚠️ Using expired cache due to database error");
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "X-Cache-Status": "STALE",
          "X-Data-Source": "Database (Error Fallback)",
        },
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from database",
        details: {
          type: error.name,
          message: error.message,
          hint: "ตรวจสอบว่า database มีตาราง n_saleIncentive และ n_staff",
        },
        data: [],
      },
      { status: 500 }
    );
  }
}
// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
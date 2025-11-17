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

    console.log(`📡 Fetching revenue from bjh_all_leads...`);

    // SQL query จาก bjh_all_leads อย่างเดียว
    let query = `
      SELECT 
        contact_staff,
        TO_CHAR(
          CASE 
            WHEN surgery_date ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' 
            THEN TO_DATE(surgery_date, 'DD/MM/YYYY')
            WHEN surgery_date ~ '^[0-9]+$' AND surgery_date::INTEGER BETWEEN 1 AND 100000
            THEN DATE '1899-12-30' + surgery_date::INTEGER
            ELSE NULL 
          END, 
          'YYYY-MM-DD'
        ) as surgery_date,
        doctor,
        customer_name,
        phone,
        CASE 
          WHEN proposed_amount ~ '^[0-9,]+$' 
          THEN ROUND(CAST(REPLACE(proposed_amount, ',', '') AS NUMERIC))::INTEGER
          ELSE NULL
        END AS proposed_amount,
        appointment_time
      FROM postgres."BJH-Server".bjh_all_leads
      WHERE surgery_date IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM 
        CASE 
          WHEN surgery_date ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date, 'DD/MM/YYYY')
          WHEN surgery_date ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::INTEGER
          ELSE NULL 
        END) = $${paramIndex++} AND EXTRACT(YEAR FROM 
        CASE 
          WHEN surgery_date ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date, 'DD/MM/YYYY')
          WHEN surgery_date ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(month), parseInt(year));
    } else if (year) {
      query += ` AND EXTRACT(YEAR FROM 
        CASE 
          WHEN surgery_date ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date, 'DD/MM/YYYY')
          WHEN surgery_date ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(year));
    }

    // Filter by contact person if provided
    if (contactPerson && contactPerson !== "all") {
      query += ` AND contact_staff = $${paramIndex++}`;
      params.push(contactPerson);
    }

    // Order by surgery_date
    query += ` ORDER BY 
      CASE 
        WHEN surgery_date ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date, 'DD/MM/YYYY')
        WHEN surgery_date ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::INTEGER
        ELSE NULL 
      END DESC NULLS LAST`;

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      console.log(
        `✅ Successfully fetched ${result.rows.length} revenue records from database`
      );

      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database (bjh_all_leads)",
        debug: {
          filters: {
            month: month || "all",
            year: year || "all",
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
          hint: "ตรวจสอบว่า database มีตาราง bjh_all_leads",
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

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/sale-incentive-db
 * ดึงข้อมูล Sale Incentive จาก PostgreSQL Database
 * แทนที่ Python API ที่ดึงจาก Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const salePerson = searchParams.get("sale_person");

    // Check cache first
    const cacheKey = `sale-incentive-db-${month || "all"}-${year || "all"}-${
      salePerson || "all"
    }`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached sale incentive from database`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }

    console.log(`📡 Fetching sale incentive from database...`);

    // สร้าง SQL query แบบ dynamic
    let query = `
      SELECT 
        id,
        sale_person,
        TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date,
        income,
        day,
        month,
        year,
        customer_name,
        notes,
        data_source,
        created_at,
        updated_at
      FROM sale_incentive
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided
    if (month && year) {
      query += ` AND month = $${paramIndex++}`;
      params.push(parseInt(month));
      query += ` AND year = $${paramIndex++}`;
      params.push(parseInt(year));
    } else if (year) {
      query += ` AND year = $${paramIndex++}`;
      params.push(parseInt(year));
    }

    // Filter by sale person if provided
    if (salePerson && salePerson !== "all") {
      query += ` AND sale_person = $${paramIndex++}`;
      params.push(salePerson);
    }

    // Order by date
    query += ` ORDER BY sale_date DESC, created_at DESC`;

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      console.log(
        `✅ Successfully fetched ${result.rows.length} sale incentive records from database`
      );

      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total_records: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database",
        debug: {
          filters: {
            month: month || "all",
            year: year || "all",
            sale_person: salePerson || "all",
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
    console.error("Error fetching sale incentive from database:", error);

    // Return cached data if available even if expired
    const cached = cache.get("sale-incentive-db");
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
          hint: "ตรวจสอบว่า database มีตาราง sale_incentive และ connection ทำงานปกติ",
        },
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sale-incentive-db
 * เพิ่มข้อมูล Sale Incentive ใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sale_person, sale_date, income, customer_name, notes } = body;

    // Validate required fields
    if (!sale_person || !sale_date || income === undefined || income === null) {
      return NextResponse.json(
        {
          success: false,
          error: "sale_person, sale_date, and income are required",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO sale_incentive (
          sale_person, sale_date, income, customer_name, notes
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        sale_person,
        sale_date,
        income,
        customer_name || null,
        notes || null,
      ];

      const result = await client.query(query, values);

      // Clear cache
      cache.clear();

      return NextResponse.json(
        {
          success: true,
          data: result.rows[0],
          message: "Sale incentive created successfully",
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error creating sale incentive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create sale incentive",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sale-incentive-db
 * อัพเดทข้อมูล Sale Incentive
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 }
      );
    }

    // สร้าง dynamic update query
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 }
      );
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = [id, ...fields.map((field) => updateData[field])];

    const client = await pool.connect();
    try {
      const query = `
        UPDATE sale_incentive
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Sale incentive not found",
          },
          { status: 404 }
        );
      }

      // Clear cache
      cache.clear();

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: "Sale incentive updated successfully",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error updating sale incentive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update sale incentive",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sale-incentive-db
 * ลบข้อมูล Sale Incentive
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `DELETE FROM sale_incentive WHERE id = $1 RETURNING id`;
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Sale incentive not found",
          },
          { status: 404 }
        );
      }

      // Clear cache
      cache.clear();

      return NextResponse.json({
        success: true,
        message: "Sale incentive deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error deleting sale incentive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete sale incentive",
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
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// บังคับให้ใช้ Node.js runtime (ไม่ใช่ Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// สร้าง connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "n8n.bjhbangkok.com",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Bjh12345!!",
  database: process.env.DB_NAME || "postgres",
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function GET(request: NextRequest) {
  let client;
  try {
    // ตรวจสอบว่ามี DATABASE_URL หรือไม่
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL not configured",
        },
        { status: 500 }
      );
    }

    // เชื่อมต่อกับฐานข้อมูล
    client = await pool.connect();

    // Query โดยระบุ schema และ table ชัดเจน - ใช้ข้อมูลจากตาราง user
    const result = await client.query(`
      SELECT 
        id, 
        name,
        status_rank
      FROM "BJH-Server"."user" 
      WHERE status_rank IN ('Front Desk', 'OR')
      ORDER BY id DESC
    `);

    // Map ข้อมูลให้ตรงกับ interface ที่ใช้ใน frontend
    const mappedEmployees = result.rows.map((emp: any) => ({
      id: emp.id,
      full_name: emp.name,
      role: emp.status_rank,
      yearly_leave_quota: 10,
      leave_remaining: 10,
      work_start_time: "08:00",
      work_end_time: "19:00",
      is_active: true,
    }));

    return NextResponse.json({
      success: true,
      data: mappedEmployees,
    });
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        error: `Error connecting to database: ${error.message}`,
      },
      { status: 500 }
    );
  } finally {
    // ปล่อย connection กลับไปยัง pool
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const {
      full_name,
      role,
      yearly_leave_quota,
      leave_remaining,
      work_start_time,
      work_end_time,
      is_active,
    } = body;

    // Validation
    if (!full_name) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกชื่อ-นามสกุล",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO hr_employees (
        full_name,
        role,
        yearly_leave_quota,
        leave_remaining,
        work_start_time,
        work_end_time,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        full_name,
        role || null,
        yearly_leave_quota || 10,
        leave_remaining || 10,
        work_start_time || "08:00",
        work_end_time || "19:00",
        is_active !== undefined ? is_active : true,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "บันทึกข้อมูลพนักงานสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create employee",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const {
      id,
      full_name,
      role,
      yearly_leave_quota,
      leave_remaining,
      work_start_time,
      work_end_time,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุ ID",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();
    const result = await client.query(
      `UPDATE hr_employees
      SET
        full_name = $1,
        role = $2,
        yearly_leave_quota = $3,
        leave_remaining = $4,
        work_start_time = $5,
        work_end_time = $6,
        is_active = $7
      WHERE id = $8
      RETURNING *`,
      [
        full_name,
        role || null,
        yearly_leave_quota || 10,
        leave_remaining || 10,
        work_start_time || "08:00",
        work_end_time || "19:00",
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "อัพเดทข้อมูลพนักงานสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update employee",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุ ID",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query(`DELETE FROM hr_employees WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลพนักงานสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete employee",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

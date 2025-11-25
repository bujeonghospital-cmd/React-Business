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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const employeeId = searchParams.get("employee_id");

    client = await pool.connect();

    let queryText;
    let params: any[] = [];

    if (month && year) {
      // ดึงข้อมูลตามเดือน
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

      if (employeeId) {
        queryText = `
          SELECT 
            a.*,
            CONCAT(u.name, ' ', COALESCE(u.last_name, u.lname, '')) as employee_name,
            u.status_rank
          FROM "BJH-Server".hr_attendance a
          LEFT JOIN "BJH-Server"."user" u ON a.employee_id = u.id
          WHERE a.work_date >= $1
            AND a.work_date <= $2
            AND a.employee_id = $3
          ORDER BY a.work_date DESC, a.time_in DESC
        `;
        params = [startDate, endDate, employeeId];
      } else {
        queryText = `
          SELECT 
            a.*,
            CONCAT(u.name, ' ', COALESCE(u.last_name, u.lname, '')) as employee_name,
            u.status_rank
          FROM "BJH-Server".hr_attendance a
          LEFT JOIN "BJH-Server"."user" u ON a.employee_id = u.id
          WHERE a.work_date >= $1
            AND a.work_date <= $2
          ORDER BY a.work_date DESC, a.time_in DESC
        `;
        params = [startDate, endDate];
      }
    } else if (employeeId) {
      queryText = `
        SELECT 
          a.*,
          CONCAT(u.name, ' ', COALESCE(u.last_name, u.lname, '')) as employee_name,
          u.status_rank
        FROM "BJH-Server".hr_attendance a
        LEFT JOIN "BJH-Server"."user" u ON a.employee_id = u.id
        WHERE a.employee_id = $1
        ORDER BY a.work_date DESC, a.time_in DESC
      `;
      params = [employeeId];
    } else {
      // ดึงข้อมูลทั้งหมด
      queryText = `
        SELECT 
          a.*,
          CONCAT(u.name, ' ', COALESCE(u.last_name, u.lname, '')) as employee_name,
          u.status_rank
        FROM "BJH-Server".hr_attendance a
        LEFT JOIN "BJH-Server"."user" u ON a.employee_id = u.id
        ORDER BY a.work_date DESC, a.time_in DESC
        LIMIT 100
      `;
      params = [];
    }

    const result = await client.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch attendances",
      },
      { status: 500 }
    );
  } finally {
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
      employee_id,
      work_date,
      time_in,
      time_out,
      status,
      work_hours,
      overtime_hours,
      note,
    } = body;

    // Validation
    if (!employee_id || !work_date) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุพนักงานและวันที่",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // ตรวจสอบว่ามีข้อมูลการเข้างานของพนักงานคนนี้ในวันนี้แล้วหรือไม่
    const existingCheck = await client.query(
      `SELECT id FROM "BJH-Server".hr_attendance
       WHERE employee_id = $1 AND work_date = $2`,
      [employee_id, work_date]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "มีข้อมูลการเข้างานของพนักงานคนนี้ในวันนี้แล้ว",
        },
        { status: 400 }
      );
    }

    const result = await client.query(
      `INSERT INTO "BJH-Server".hr_attendance (
        employee_id,
        work_date,
        time_in,
        time_out,
        status,
        work_hours,
        overtime_hours,
        note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        employee_id,
        work_date,
        time_in || null,
        time_out || null,
        status || "PRESENT",
        work_hours || 0,
        overtime_hours || 0,
        note || null,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "บันทึกข้อมูลการเข้างานสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create attendance",
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
      employee_id,
      work_date,
      time_in,
      time_out,
      status,
      work_hours,
      overtime_hours,
      note,
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
      `UPDATE "BJH-Server".hr_attendance
      SET
        employee_id = $1,
        work_date = $2,
        time_in = $3,
        time_out = $4,
        status = $5,
        work_hours = $6,
        overtime_hours = $7,
        note = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        employee_id,
        work_date,
        time_in || null,
        time_out || null,
        status || "PRESENT",
        work_hours || 0,
        overtime_hours || 0,
        note || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "อัพเดทข้อมูลการเข้างานสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update attendance",
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

    await client.query(`DELETE FROM "BJH-Server".hr_attendance WHERE id = $1`, [
      id,
    ]);

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลการเข้างานสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete attendance",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

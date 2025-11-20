import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
/**
 * POST /api/film-contacts/update-last-followup
 * อัพเดทวันที่ติดต่อ (last_followup) ใน database เป็นเวลาปัจจุบัน
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ ID",
        },
        { status: 400 }
      );
    }
    console.log(`🔄 Updating last followup for ID ${id}...`);
    // อัพเดท last_followup ใน database เป็นเวลาปัจจุบัน
    const query = `
      UPDATE postgres."BJH-Server".bjh_all_leads 
      SET last_followup = NOW()
      WHERE id = $1
      RETURNING id, last_followup
    `;
    const result = await client.query(query, [id]);
    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลที่ต้องการอัพเดท",
        },
        { status: 404 }
      );
    }
    console.log(`✅ Updated last followup for ID ${id} successfully`);
    return NextResponse.json({
      success: true,
      message: "บันทึกวันที่ติดต่อสำเร็จ",
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error updating last followup:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
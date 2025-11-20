import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
/**
 * POST /api/film-contacts/update-next-contact
 * อัพเดทวันที่ติดต่อครั้งถัดไป (next_followup) ใน database
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id, nextContactDate } = body;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ ID",
        },
        { status: 400 }
      );
    }
    console.log(`🔄 Updating next contact date for ID ${id}...`);
    // อัพเดท next_followup ใน database
    const query = `
      UPDATE postgres."BJH-Server".bjh_all_leads 
      SET next_followup = $1
      WHERE id = $2
      RETURNING id, next_followup
    `;
    const result = await client.query(query, [nextContactDate || null, id]);
    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลที่ต้องการอัพเดท",
        },
        { status: 404 }
      );
    }
    console.log(`✅ Updated next contact date for ID ${id} successfully`);
    return NextResponse.json({
      success: true,
      message: "บันทึกวันที่ติดต่อครั้งถัดไปสำเร็จ",
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error updating next contact date:", error);
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
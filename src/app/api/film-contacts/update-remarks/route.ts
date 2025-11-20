import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
/**
 * POST /api/film-contacts/update-remarks
 * อัพเดทหมายเหตุ (note) ใน database
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id, remarks } = body;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ ID",
        },
        { status: 400 }
      );
    }
    console.log(`🔄 Updating remarks for ID ${id}...`);
    // อัพเดท note ใน database
    const query = `
      UPDATE postgres."BJH-Server".bjh_all_leads 
      SET note = $1
      WHERE id = $2
      RETURNING id, note
    `;
    const result = await client.query(query, [remarks || "", id]);
    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลที่ต้องการอัพเดท",
        },
        { status: 404 }
      );
    }
    console.log(`✅ Updated remarks for ID ${id} successfully`);
    return NextResponse.json({
      success: true,
      message: "บันทึกหมายเหตุสำเร็จ",
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error updating remarks:", error);
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
import { NextResponse } from "next/server";
import pool from "@/lib/db";
export async function GET() {
  let client;
  try {
    client = await pool.connect();
    console.log("🔍 Fetching departments from database...");
    const query = `
      SELECT id, name, name_full_th 
      FROM "BJH-Server".department 
      ORDER BY name_full_th ASC
    `;
    const result = await client.query(query);
    console.log(`✅ Found ${result.rows.length} departments`);
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching departments:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนก",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
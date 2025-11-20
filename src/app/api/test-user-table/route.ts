import { NextResponse } from "next/server";
import pool from "@/lib/db";
export async function GET() {
  let client;
  try {
    client = await pool.connect();
    console.log("🔍 Checking user table structure...");
    // Query to get table columns
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'BJH-Server' 
      AND table_name = 'user'
      ORDER BY ordinal_position;
    `;
    const result = await client.query(query);
    console.log("📋 User table columns:", result.rows);
    return NextResponse.json({
      success: true,
      columns: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error("❌ Error checking table:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบตาราง",
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
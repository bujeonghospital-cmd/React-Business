import { NextResponse } from "next/server";
import pool from "@/lib/db";

interface StaffRow {
  code: string | null;
  nickname: string | null;
}

export async function GET() {
  const client = await pool.connect();

  try {
    const result = await client.query<StaffRow>(
      `SELECT code, nickname
       FROM "BJH-Server".n_staff
       WHERE nickname IS NOT NULL AND TRIM(nickname) <> ''
       ORDER BY nickname ASC`
    );

    const data = result.rows
      .map((row) => ({
        code: row.code ? String(row.code) : "",
        nickname: row.nickname ? row.nickname.trim() : "",
      }))
      .filter((item) => item.nickname.length > 0);

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: "PostgreSQL Database (n_staff)",
    });
  } catch (error: any) {
    console.error("Error fetching n_staff nicknames:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch staff nicknames",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
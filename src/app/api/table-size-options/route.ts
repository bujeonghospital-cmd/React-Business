import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, size_value, size_label, sort_order 
         FROM "BJH-Server".table_size_options 
         WHERE is_active = true 
         ORDER BY sort_order ASC`
      );

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching table size options:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch table size options",
      },
      { status: 500 }
    );
  }
}

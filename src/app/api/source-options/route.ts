import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // Check if database configuration exists
    if (!process.env.DB_HOST) {
      console.error("❌ Database environment variables not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration missing",
          details:
            "DB_HOST environment variable is not set. Please configure database settings in Vercel.",
        },
        { status: 500 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT 
          source_name AS "value",
          source_name AS "label"
        FROM "BJH-Server".source_options
        ORDER BY id
      `);

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("❌ Error fetching source options:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      host: process.env.DB_HOST,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch source options",
        details: error.message || error.code || "Unknown database error",
        hint: "Check if database is accessible and credentials are correct",
      },
      { status: 500 }
    );
  }
}

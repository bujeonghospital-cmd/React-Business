import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs";
import path from "path";
/**
 * GET /api/setup-database-tables
 * สร้างตาราง surgery_schedule และ sale_incentive
 */
export async function GET(request: NextRequest) {
  let client;
  try {
    console.log("📋 Starting database setup...");
    // Test connection first
    console.log("🔗 Testing database connection...");
    client = await pool.connect();
    const testResult = await client.query("SELECT NOW()");
    console.log("✅ Database connected:", testResult.rows[0].now);
    // Read SQL schema file
    const schemaPath = path.join(process.cwd(), "surgery-schedule-schema.sql");
    if (!fs.existsSync(schemaPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "SQL schema file not found",
          hint: "Make sure surgery-schedule-schema.sql exists in the project root",
        },
        { status: 500 }
      );
    }
    const sqlContent = fs.readFileSync(schemaPath, "utf8");
    console.log("✅ SQL schema file loaded");
    // Split SQL into individual statements and execute them one by one
    console.log("🚀 Creating database tables...");
    // Execute the entire SQL file
    // Increase statement timeout for this operation
    await client.query("SET statement_timeout = 60000"); // 60 seconds
    await client.query(sqlContent);
    console.log("✅ Database tables created successfully!");
    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
      tables: ["surgery_schedule", "sale_incentive"],
      views: [
        "daily_revenue_summary",
        "monthly_revenue_summary",
        "monthly_surgery_count",
        "monthly_actual_surgery_count",
      ],
      next_steps: [
        "Run migration script to import data from Google Sheets",
        "Test API endpoints: /api/surgery-schedule-db and /api/sale-incentive-db",
        "Test Performance Surgery Schedule page",
      ],
    });
  } catch (error: any) {
    console.error("❌ Error creating database tables:", error);
    // Check for specific error codes
    if (error.code === "42P07") {
      return NextResponse.json({
        success: true,
        message: "Tables already exist",
        note: "This is OK - tables were already created",
      });
    }
    // Connection timeout error
    if (
      error.message?.includes("timeout") ||
      error.message?.includes("terminated")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection timeout",
          hint: "Database server might be slow or unreachable. Please check:\n1. Database host is correct\n2. Database server is running\n3. Network/firewall allows connection\n4. Try using a local database or Supabase for better connectivity",
          details: {
            message: error.message,
          },
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create database tables",
        details: {
          code: error.code,
          hint: error.hint,
          detail: error.detail,
        },
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
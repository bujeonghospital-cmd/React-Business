import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
export async function GET(request: NextRequest) {
  try {
    // Test database connection and return diagnostic info
    console.log("🔍 Testing database connection...");
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL not configured",
          diagnostics: {
            hasEnvVar: false,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
    // Test basic connection
    const testQuery = await pool.query(
      "SELECT current_database(), current_schema()"
    );
    console.log("✅ Database connection OK:", testQuery.rows[0]);
    // Check available schemas
    const schemasQuery = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('BJH-Server', 'public', 'postgres')
    `);
    console.log("📁 Available schemas:", schemasQuery.rows);
    // Check if table exists in any schema
    const tablesQuery = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE tablename = 'status_options'
    `);
    console.log("📋 status_options table locations:", tablesQuery.rows);
    return NextResponse.json({
      success: true,
      diagnostics: {
        hasEnvVar: true,
        currentDatabase: testQuery.rows[0].current_database,
        currentSchema: testQuery.rows[0].current_schema,
        availableSchemas: schemasQuery.rows.map((r) => r.schema_name),
        tableLocations: tablesQuery.rows,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Database diagnostic error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        code: error.code,
        detail: error.detail,
        diagnostics: {
          hasEnvVar: !!process.env.DATABASE_URL,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
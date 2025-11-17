/**
 * Create Database Tables Script
 *
 * สคริปต์นี้ใช้สำหรับสร้างตาราง surgery_schedule และ sale_incentive
 * ในฐานข้อมูล PostgreSQL
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

console.log("Starting script...");

// โหลด environment variables จาก .env.local
try {
  require("dotenv").config({ path: ".env.local" });
  console.log("Loaded environment variables");
} catch (error) {
  console.log(
    "Warning: Could not load .env.local, using environment variables"
  );
}

// Database Configuration
const pool = new Pool({
  host: process.env.DB_HOST || "n8n.bjhbangkok.com",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Bjh12345!!",
  database: process.env.DB_NAME || "postgres",
  ssl: false,
});

async function createTables() {
  console.log("================================================");
  console.log("   Database Setup - Create Tables");
  console.log("================================================\n");

  try {
    // Test database connection
    console.log("🔗 Testing database connection...");
    const testResult = await pool.query("SELECT NOW()");
    console.log("✅ Database connected:", testResult.rows[0].now);
    console.log("");

    // Read SQL schema file
    const schemaPath = path.join(
      __dirname,
      "..",
      "surgery-schedule-schema.sql"
    );
    console.log("📄 Reading SQL schema file...");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const sqlContent = fs.readFileSync(schemaPath, "utf8");
    console.log("✅ SQL schema file loaded");
    console.log("");

    // Execute SQL
    console.log("🚀 Creating database tables...");
    console.log("");

    const client = await pool.connect();
    try {
      await client.query(sqlContent);

      console.log("✅ Database tables created successfully!\n");
      console.log("Tables created:");
      console.log("   - surgery_schedule");
      console.log("   - sale_incentive\n");
      console.log("Views created:");
      console.log("   - daily_revenue_summary");
      console.log("   - monthly_revenue_summary");
      console.log("   - monthly_surgery_count");
      console.log("   - monthly_actual_surgery_count\n");
      console.log("================================================\n");
      console.log("Next steps:");
      console.log("1. Run migration script: npm run migrate:sheets-to-db");
      console.log("2. Test API endpoints");
      console.log("3. Test Performance Surgery Schedule page\n");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("\n❌ Error creating database tables:");
    console.error(error.message);

    if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Hint: Cannot connect to database. Check:");
      console.error("   - DB_HOST is correct");
      console.error("   - Database server is running");
      console.error("   - Firewall allows connection");
    } else if (error.code === "42P07") {
      console.log("\n⚠️  Tables already exist. This is OK!");
    } else {
      console.error(
        "\n💡 Hint:",
        error.hint || "Check SQL syntax and database permissions"
      );
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run script
createTables();

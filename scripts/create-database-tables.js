/**
 * Create Database Tables Script
 *
 * สคริปต์นี้ใช้สำหรับสร้างตาราง surgery_schedule และ sale_incentive
 * ในฐานข้อมูล PostgreSQL
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// โหลด environment variables จาก .env.local
try {
  require("dotenv").config({ path: ".env.local" });
  } catch (error) {
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
        try {
    // Test database connection
        const testResult = await pool.query("SELECT NOW()");
            // Read SQL schema file
    const schemaPath = path.join(
      __dirname,
      "..",
      "surgery-schedule-schema.sql"
    );
        if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const sqlContent = fs.readFileSync(schemaPath, "utf8");
            // Execute SQL
            const client = await pool.connect();
    try {
      await client.query(sqlContent);

                                                                                        } finally {
      client.release();
    }
  } catch (error) {
            if (error.code === "ECONNREFUSED") {
                            } else if (error.code === "42P07") {
          } else {
          }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run script
createTables();
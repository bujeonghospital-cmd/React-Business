import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
/**
 * GET /api/quick-setup-tables
 * สร้างตารางแบบง่ายๆ เฉพาะตารางหลัก (ไม่รวม views และ indexes ที่ซับซ้อน)
 */
export async function GET(request: NextRequest) {
  let client;
  try {
    console.log("📋 Quick setup - Creating basic tables...");
    // Test connection first
    console.log("🔗 Testing database connection...");
    client = await pool.connect();
    const testResult = await client.query("SELECT NOW()");
    console.log("✅ Database connected:", testResult.rows[0].now);
    // Create surgery_schedule table
    console.log("📊 Creating surgery_schedule table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS surgery_schedule (
        id BIGSERIAL PRIMARY KEY,
        doctor TEXT,
        contact_person TEXT,
        customer_name TEXT,
        phone TEXT,
        date_surgery_scheduled DATE,
        appointment_time TEXT,
        surgery_date DATE,
        date_consult_scheduled DATE,
        proposed_amount NUMERIC(12, 2),
        status TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        data_source TEXT DEFAULT 'database'
      );
    `);
    console.log("✅ surgery_schedule table created");
    // Create basic indexes for surgery_schedule
    console.log("📑 Creating indexes for surgery_schedule...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_surgery_contact_person 
        ON surgery_schedule(contact_person);
      CREATE INDEX IF NOT EXISTS idx_surgery_scheduled_date 
        ON surgery_schedule(date_surgery_scheduled);
      CREATE INDEX IF NOT EXISTS idx_surgery_actual_date 
        ON surgery_schedule(surgery_date);
    `);
    console.log("✅ Indexes created for surgery_schedule");
    // Create sale_incentive table
    console.log("💰 Creating sale_incentive table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS sale_incentive (
        id BIGSERIAL PRIMARY KEY,
        sale_person TEXT NOT NULL,
        sale_date DATE NOT NULL,
        income NUMERIC(12, 2) NOT NULL,
        day INTEGER,
        month INTEGER,
        year INTEGER,
        customer_name TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        data_source TEXT DEFAULT 'database'
      );
    `);
    console.log("✅ sale_incentive table created");
    // Create basic indexes for sale_incentive
    console.log("📑 Creating indexes for sale_incentive...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sale_person 
        ON sale_incentive(sale_person);
      CREATE INDEX IF NOT EXISTS idx_sale_date 
        ON sale_incentive(sale_date);
      CREATE INDEX IF NOT EXISTS idx_sale_year_month 
        ON sale_incentive(year, month);
    `);
    console.log("✅ Indexes created for sale_incentive");
    // Create trigger function for updated_at
    console.log("🔧 Creating triggers...");
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql';
    `);
    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_surgery_schedule_updated_at 
        ON surgery_schedule;
      CREATE TRIGGER trigger_update_surgery_schedule_updated_at 
        BEFORE UPDATE ON surgery_schedule
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_sale_incentive_updated_at 
        ON sale_incentive;
      CREATE TRIGGER trigger_update_sale_incentive_updated_at 
        BEFORE UPDATE ON sale_incentive
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
    // Create trigger for auto-populate day, month, year
    await client.query(`
      CREATE OR REPLACE FUNCTION extract_date_parts_sale_incentive()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.day = EXTRACT(DAY FROM NEW.sale_date);
          NEW.month = EXTRACT(MONTH FROM NEW.sale_date);
          NEW.year = EXTRACT(YEAR FROM NEW.sale_date);
          RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql';
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_extract_date_parts_sale_incentive 
        ON sale_incentive;
      CREATE TRIGGER trigger_extract_date_parts_sale_incentive 
        BEFORE INSERT OR UPDATE ON sale_incentive
        FOR EACH ROW 
        EXECUTE FUNCTION extract_date_parts_sale_incentive();
    `);
    console.log("✅ Triggers created");
    console.log("✅ All tables created successfully!");
    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
      tables: [
        {
          name: "surgery_schedule",
          status: "created",
          indexes: ["contact_person", "date_surgery_scheduled", "surgery_date"],
        },
        {
          name: "sale_incentive",
          status: "created",
          indexes: ["sale_person", "sale_date", "year_month"],
        },
      ],
      triggers: [
        "update_updated_at_column",
        "extract_date_parts_sale_incentive",
      ],
      next_steps: [
        "Test connection: http://localhost:3000/api/surgery-schedule-db",
        "Add test data or run migration",
        "View performance page: http://localhost:3000/performance-surgery-schedule",
      ],
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    if (error.code === "42P07") {
      return NextResponse.json({
        success: true,
        message: "Tables already exist - this is OK!",
        note: "Tables were already created previously",
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create tables",
        code: error.code,
        hint: "If connection timeout: Check DB_HOST, network, or use Supabase instead",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
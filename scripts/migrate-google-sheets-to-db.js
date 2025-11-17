/**
 * Migration Script: Google Sheets to PostgreSQL Database
 *
 * สคริปต์นี้ใช้สำหรับย้ายข้อมูลจาก Google Sheets เข้า PostgreSQL Database
 * - ดึงข้อมูลจาก Python API (Google Sheets)
 * - แปลงข้อมูลให้ตรงกับ database schema
 * - Insert เข้า PostgreSQL Database
 */

const https = require("https");
const { Pool } = require("pg");

// Database Configuration
const pool = new Pool({
  host: process.env.DB_HOST || "n8n.bjhbangkok.com",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Bjh12345!!",
  database: process.env.DB_NAME || "postgres",
  ssl: false,
});

// Python API Configuration
const PYTHON_API_URL =
  process.env.PYTHON_API_URL ||
  "https://believable-ambition-production.up.railway.app";

/**
 * Fetch data from Python API
 */
async function fetchFromPythonAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${PYTHON_API_URL}${endpoint}`;
    console.log(`📡 Fetching from: ${url}`);

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.success) {
              console.log(`✅ Fetched ${parsed.data?.length || 0} records`);
              resolve(parsed.data || []);
            } else {
              reject(new Error(parsed.error || "Failed to fetch data"));
            }
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Parse date string to PostgreSQL DATE format (YYYY-MM-DD)
 */
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === "") return null;

  const cleanStr = dateStr.trim();

  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return cleanStr;
  }

  // Try DD/MM/YYYY format (Thai format)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
    const parts = cleanStr.split("/").map(Number);
    const [day, month, year] = parts;

    // Validate
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const paddedMonth = String(month).padStart(2, "0");
      const paddedDay = String(day).padStart(2, "0");
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  }

  return null;
}

/**
 * Parse amount string to number
 */
function parseAmount(amountStr) {
  if (!amountStr || amountStr.trim() === "") return null;

  // Remove all non-numeric characters except decimal point
  const cleanStr = amountStr.replace(/[^\d.]/g, "").trim();
  const amount = parseFloat(cleanStr);

  return isNaN(amount) ? null : amount;
}

/**
 * Migrate Surgery Schedule data (Film data)
 */
async function migrateSurgerySchedule() {
  console.log("\n📋 Starting Surgery Schedule migration...\n");

  const client = await pool.connect();
  try {
    // Fetch data from Python API
    const data = await fetchFromPythonAPI("/api/film-data");

    if (!data || data.length === 0) {
      console.log("⚠️  No data to migrate");
      return { success: 0, failed: 0 };
    }

    console.log(`📊 Found ${data.length} records to migrate\n`);

    let successCount = 0;
    let failedCount = 0;

    // Start transaction
    await client.query("BEGIN");

    for (const item of data) {
      try {
        // Parse dates
        const dateSurgeryScheduled = parseDate(
          item.date_surgery_scheduled || item.วันที่ได้นัดผ่าตัด || ""
        );
        const surgeryDate = parseDate(
          item.surgery_date || item.วันที่ผ่าตัด || ""
        );
        const dateConsultScheduled = parseDate(
          item.date_consult_scheduled || ""
        );

        // Parse amount
        const proposedAmount = parseAmount(item.ยอดนำเสนอ || "0");

        // Insert into database
        const query = `
          INSERT INTO surgery_schedule (
            doctor, contact_person, customer_name, phone,
            date_surgery_scheduled, appointment_time, surgery_date,
            date_consult_scheduled, proposed_amount, status, notes,
            data_source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT DO NOTHING
        `;

        const values = [
          item.หมอ || item.doctor || null,
          item.ผู้ติดต่อ || item.contact_person || null,
          item.ชื่อ || item.customer_name || null,
          item.เบอร์โทร || item.phone || null,
          dateSurgeryScheduled,
          item.เวลาที่นัด || item.appointment_time || null,
          surgeryDate,
          dateConsultScheduled,
          proposedAmount,
          item.status || null,
          item.notes || null,
          "migrated_from_google_sheets",
        ];

        await client.query(query, values);
        successCount++;

        if (successCount % 100 === 0) {
          console.log(`✅ Migrated ${successCount} records...`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate record:`, error.message);
        failedCount++;
      }
    }

    // Commit transaction
    await client.query("COMMIT");

    console.log(`\n✅ Surgery Schedule migration completed:`);
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Failed: ${failedCount}\n`);

    return { success: successCount, failed: failedCount };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Migrate Sale Incentive data (N_SaleIncentive)
 */
async function migrateSaleIncentive() {
  console.log("\n💰 Starting Sale Incentive migration...\n");

  const client = await pool.connect();
  try {
    // Fetch data from Python API
    const data = await fetchFromPythonAPI("/N_SaleIncentive_data");

    if (!data || data.length === 0) {
      console.log("⚠️  No data to migrate");
      return { success: 0, failed: 0 };
    }

    console.log(`📊 Found ${data.length} records to migrate\n`);

    let successCount = 0;
    let failedCount = 0;

    // Start transaction
    await client.query("BEGIN");

    for (const item of data) {
      try {
        // Parse date (already in ISO format YYYY-MM-DD)
        const saleDate = item.sale_date;
        const income = parseFloat(item.income || 0);

        if (!saleDate || income === 0) {
          failedCount++;
          continue;
        }

        // Insert into database
        const query = `
          INSERT INTO sale_incentive (
            sale_person, sale_date, income,
            customer_name, notes, data_source
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `;

        const values = [
          item.sale_person || null,
          saleDate,
          income,
          item.customer_name || null,
          item.notes || null,
          "migrated_from_google_sheets",
        ];

        await client.query(query, values);
        successCount++;

        if (successCount % 100 === 0) {
          console.log(`✅ Migrated ${successCount} records...`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate record:`, error.message);
        failedCount++;
      }
    }

    // Commit transaction
    await client.query("COMMIT");

    console.log(`\n✅ Sale Incentive migration completed:`);
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Failed: ${failedCount}\n`);

    return { success: successCount, failed: failedCount };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("🚀 Starting migration from Google Sheets to Database...\n");

  try {
    // Test database connection
    console.log("🔗 Testing database connection...");
    const testResult = await pool.query("SELECT NOW()");
    console.log("✅ Database connected:", testResult.rows[0].now);

    // Migrate Surgery Schedule
    const surgeryResult = await migrateSurgerySchedule();

    // Migrate Sale Incentive
    const saleResult = await migrateSaleIncentive();

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Surgery Schedule:`);
    console.log(`  - Success: ${surgeryResult.success}`);
    console.log(`  - Failed: ${surgeryResult.failed}`);
    console.log(`\nSale Incentive:`);
    console.log(`  - Success: ${saleResult.success}`);
    console.log(`  - Failed: ${saleResult.failed}`);
    console.log("=".repeat(60));
    console.log("\n✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrate();

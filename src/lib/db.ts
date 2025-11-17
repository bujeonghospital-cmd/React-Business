import { Pool } from "pg";

// สร้าง connection pool สำหรับ PostgreSQL (n8n.bjhbangkok.com)
// Debug: แสดง config ที่กำลังใช้
console.log("🔧 Database Configuration:");
console.log("   Host:", process.env.DB_HOST || "n8n.bjhbangkok.com");
console.log("   Port:", process.env.DB_PORT || "5432");
console.log("   User:", process.env.DB_USER || "postgres");
console.log("   Database:", process.env.DB_NAME || "postgres");
console.log(
  "   Password:",
  process.env.DB_PASSWORD
    ? "***" + process.env.DB_PASSWORD.slice(-4)
    : "NOT SET"
);
console.log("   SSL:", "disabled");

const pool = new Pool({
  host: process.env.DB_HOST || "n8n.bjhbangkok.com",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Bjh12345!!",
  database: process.env.DB_NAME || "postgres",
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // เพิ่มเป็น 10 วินาที
  statement_timeout: 30000, // Query timeout 30 วินาที
  query_timeout: 30000,
  // n8n ไม่รองรับ SSL
  ssl: false,
});

// ตรวจสอบการเชื่อมต่อ
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
  console.log(`Host: ${process.env.DB_HOST || "n8n.bjhbangkok.com"}`);
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  console.error(
    `Failed to connect to: ${process.env.DB_HOST || "n8n.bjhbangkok.com"}`
  );
  // ไม่ exit ใน production เพื่อให้ retry ได้
  if (process.env.NODE_ENV !== "production") {
    process.exit(-1);
  }
});

export default pool;

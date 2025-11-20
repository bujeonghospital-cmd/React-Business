import { Pool } from "pg";
// สร้าง connection pool สำหรับ PostgreSQL (n8n.bjhbangkok.com)
const pool = new Pool({
  host: process.env.DB_HOST || "n8n.bjhbangkok.com",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Bjh12345!!",
  database: process.env.DB_NAME || "postgres",
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // เพิ่มเป็น 30 วินาที
  statement_timeout: 60000, // Query timeout 60 วินาที
  query_timeout: 60000,
  // n8n ไม่รองรับ SSL
  ssl: false,
});
// ตรวจสอบการเชื่อมต่อ
pool.on("connect", () => {
  // Connected to database
});
pool.on("error", (err) => {
  // Database error
  // ไม่ exit ใน production เพื่อให้ retry ได้
  if (process.env.NODE_ENV !== "production") {
    process.exit(-1);
  }
});
export default pool;

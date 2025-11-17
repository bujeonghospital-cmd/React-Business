const { Pool } = require("pg");

console.log("Script starting...");

const pool = new Pool({
  host: "n8n.bjhbangkok.com",
  port: 5432,
  user: "postgres",
  password: "Bjh12345!!",
  database: "postgres",
  ssl: false,
  connectionTimeoutMillis: 5000,
});

console.log("Pool created");

(async function testConnection() {
  console.log("Test function running...");
  try {
    console.log("Testing connection to n8n.bjhbangkok.com...");

    const client = await pool.connect();
    console.log("Connected successfully!");

    const result = await client.query("SELECT NOW()");
    console.log("Server Time:", result.rows[0].now);

    // Test user table
    const userTest = await client.query('SELECT COUNT(*) FROM "user"');
    console.log("Total users:", userTest.rows[0].count);

    client.release();
    console.log("\nTest completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
})();

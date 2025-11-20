const { Pool } = require("pg");

const pool = new Pool({
  host: "n8n.bjhbangkok.com",
  port: 5432,
  user: "postgres",
  password: "Bjh12345!!",
  database: "postgres",
  ssl: false,
  connectionTimeoutMillis: 5000,
});

(async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT NOW()");
        // Test user table
    const userTest = await client.query('SELECT COUNT(*) FROM "user"');
        client.release();
        process.exit(0);
  } catch (error) {
            process.exit(1);
  }
})();
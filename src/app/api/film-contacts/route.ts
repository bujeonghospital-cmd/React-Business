import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
/**
 * GET /api/film-contacts
 * ดึงข้อมูลการติดต่อจาก PostgreSQL Database
 * Query: SELECT id, customer_name, phone, interested_product, note, status_call, last_followup, next_followup
 *        FROM postgres."BJH-Server".bjh_all_leads
 *        WHERE phone IS NOT NULL AND status_call = 'อยู่ระหว่างโทรออก'
 */
interface ContactData {
  id: string;
  dbId: number; // ID จาก database
  customerName: string;
  phoneNumber: string;
  product: string;
  remarks: string;
  status: string;
  contactDate: string;
  nextContactDate?: string; // วันที่ติดต่อครั้งถัดไป
}
export async function GET(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    console.log("🔄 Fetching contacts from PostgreSQL database...");
    // Query ดึงข้อมูลจาก database - เฉพาะรายการที่ status_call = 'อยู่ระหว่างโทรออก'
    const query = `
      SELECT 
        id,
        customer_name,
        phone,
        interested_product,
        note,
        status_call,
        last_followup,
        next_followup
      FROM postgres."BJH-Server".bjh_all_leads 
      WHERE phone IS NOT NULL
        AND status_call = 'อยู่ระหว่างโทรออก'
      ORDER BY customer_name ASC
      LIMIT 1000
    `;
    console.log("📝 Executing query:", query);
    const result = await client.query(query);
    console.log(`✅ Found ${result.rows.length} contacts from database`);
    if (result.rows.length > 0) {
      console.log("📋 Sample row:", result.rows[0]);
    }
    // แปลงข้อมูลจาก database เป็น ContactData format
    const contacts: ContactData[] = result.rows.map((row, index) => {
      // กำหนดสถานะตาม status_call
      let status: string = "pending"; // default
      if (row.status_call === "อยู่ระหว่างโทรออก") {
        status = "outgoing";
      } else if (row.status_call === "โทรเสร็จสิ้น") {
        status = "completed";
      }
      return {
        id: `db-${index + 1}`,
        dbId: row.id, // ID จาก database
        customerName: row.customer_name || row.phone || "ไม่ระบุชื่อ",
        phoneNumber: row.phone || "",
        product: row.interested_product || "",
        remarks: row.note || "",
        status: status,
        contactDate: row.last_followup || new Date().toISOString(), // ดึงจาก last_followup หรือเวลาปัจจุบัน
        nextContactDate: row.next_followup || "", // ดึงจาก next_followup
      };
    });
    console.log(`🔄 Processed ${contacts.length} contacts`);
    // Filter by search if provided
    let filteredContacts = contacts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = contacts.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(searchLower) ||
          c.phoneNumber?.includes(search) ||
          c.product?.toLowerCase().includes(searchLower) ||
          c.remarks?.toLowerCase().includes(searchLower)
      );
      console.log(
        `🔍 Filtered to ${filteredContacts.length} contacts matching search: "${search}"`
      );
    }
    return NextResponse.json({
      success: true,
      data: filteredContacts,
      total: filteredContacts.length,
      timestamp: new Date().toISOString(),
      source: "PostgreSQL Database (bjh_all_leads)",
    });
  } catch (error) {
    console.error("❌ Error fetching contacts from database:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
    });
    // Return error with details for debugging
    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database (Error)",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
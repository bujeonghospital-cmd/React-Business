import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const adIdsParam = searchParams.get("ad_ids"); // Format: comma-separated fb_ad_id (optional)
    const dateStartParam = searchParams.get("date_start"); // Format: YYYY-MM-DD (optional)
    const dateEndParam = searchParams.get("date_end"); // Format: YYYY-MM-DD (optional)

    console.log("📞 [Phone Leads SQL API] Request params:", {
      adIdsParam,
      dateStartParam,
      dateEndParam,
    });

    client = await pool.connect();
    console.log("✅ [Phone Leads SQL API] Database connected successfully");

    // Build SQL query based on the new schema
    let query: string;
    const queryParams: any[] = [];

    if (adIdsParam) {
      // Query for specific fb_ad_ids - group by fb_ad_id
      const adIds = adIdsParam.split(",").map((id) => id.trim());
      query = `
        SELECT
          ads.fb_ad_id,
          ads.ad_name,
          COUNT(DISTINCT ct.customer_id) AS customers_with_phone
        FROM "BJH-Server".fb_customer_tags AS ct
        JOIN "BJH-Server".fb_tags AS t
          ON t.id = ct.tag_id
        JOIN "BJH-Server".fb_conversations AS conv
          ON conv.customer_id = ct.customer_id
        JOIN "BJH-Server".fb_conversation_sources AS src
          ON src.conversation_id = conv.id
        JOIN "BJH-Server".fb_ads AS ads
          ON ads.id = src.ad_id
        WHERE t.name = 'phone'
          AND ads.fb_ad_id = ANY($1)`;
      queryParams.push(adIds);

      // Add date range filter if provided
      if (dateStartParam && dateEndParam) {
        query += `
          AND ct.assigned_at::date BETWEEN $2 AND $3`;
        queryParams.push(dateStartParam, dateEndParam);
      } else if (dateStartParam) {
        query += `
          AND ct.assigned_at::date >= $2`;
        queryParams.push(dateStartParam);
      } else if (dateEndParam) {
        query += `
          AND ct.assigned_at::date <= $2`;
        queryParams.push(dateEndParam);
      }

      query += `
        GROUP BY
          ads.fb_ad_id,
          ads.ad_name
        ORDER BY
          customers_with_phone DESC
      `;
    } else {
      // Query for all ad_ids with phone leads
      query = `
        SELECT
          ads.fb_ad_id,
          ads.ad_name,
          COUNT(DISTINCT ct.customer_id) AS customers_with_phone
        FROM "BJH-Server".fb_customer_tags AS ct
        JOIN "BJH-Server".fb_tags AS t
          ON t.id = ct.tag_id
        JOIN "BJH-Server".fb_conversations AS conv
          ON conv.customer_id = ct.customer_id
        JOIN "BJH-Server".fb_conversation_sources AS src
          ON src.conversation_id = conv.id
        JOIN "BJH-Server".fb_ads AS ads
          ON ads.id = src.ad_id
        WHERE t.name = 'phone'`;

      // Add date range filter if provided
      if (dateStartParam && dateEndParam) {
        query += `
          AND ct.assigned_at::date BETWEEN $1 AND $2`;
        queryParams.push(dateStartParam, dateEndParam);
      } else if (dateStartParam) {
        query += `
          AND ct.assigned_at::date >= $1`;
        queryParams.push(dateStartParam);
      } else if (dateEndParam) {
        query += `
          AND ct.assigned_at::date <= $1`;
        queryParams.push(dateEndParam);
      }

      query += `
        GROUP BY
          ads.fb_ad_id,
          ads.ad_name
        ORDER BY
          customers_with_phone DESC
      `;
    }

    console.log("📞 [Phone Leads SQL API] Executing query:", query);
    console.log("📞 [Phone Leads SQL API] Query params:", queryParams);

    const result = await client.query(query, queryParams);
    console.log(
      "✅ [Phone Leads SQL API] Query result:",
      result.rows.length,
      "rows"
    );
    console.log(
      "📊 [Phone Leads SQL API] Sample data:",
      result.rows.slice(0, 5)
    );

    // Convert to map for easy lookup
    // Format: { "fb_ad_id_1": count, "fb_ad_id_2": count, ... }
    const phoneLeadsMap: { [key: string]: number } = {};

    result.rows.forEach((row) => {
      phoneLeadsMap[row.fb_ad_id] = parseInt(row.customers_with_phone) || 0;
      console.log(
        `  📍 Ad ${row.fb_ad_id} (${row.ad_name}): ${row.customers_with_phone} phone leads`
      );
    });

    return NextResponse.json({
      success: true,
      data: phoneLeadsMap,
      details: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error("❌ [Phone Leads SQL API] Error:", error);
    console.error("❌ [Phone Leads SQL API] Error stack:", error?.stack);
    console.error("❌ [Phone Leads SQL API] Error name:", error?.name);
    console.error("❌ [Phone Leads SQL API] Error message:", error?.message);
    // Return empty data instead of error to prevent breaking the UI
    return NextResponse.json({
      success: false,
      error: "Failed to fetch phone leads data",
      details: error?.message || error?.toString() || "Unknown error",
      errorType: error?.name || "Error",
      data: {}, // Return empty object so the UI can handle it gracefully
    });
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
}

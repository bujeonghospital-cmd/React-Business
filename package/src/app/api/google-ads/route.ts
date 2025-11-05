// src/app/api/google-ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApiResponse, GoogleAdsCampaign } from "@/types/google-ads";

/**
 * Google Ads API Route
 *
 * ในการใช้งานจริง คุณจะต้อง:
 * 1. ติดตั้ง Google Ads API client library: npm install google-ads-api
 * 2. ตั้งค่า credentials ใน .env.local:
 *    GOOGLE_ADS_CLIENT_ID=xxx
 *    GOOGLE_ADS_CLIENT_SECRET=xxx
 *    GOOGLE_ADS_DEVELOPER_TOKEN=xxx
 *    GOOGLE_ADS_REFRESH_TOKEN=xxx
 *    GOOGLE_ADS_CUSTOMER_ID=xxx
 * 3. เชื่อมต่อกับ Google Ads API
 *
 * ตัวอย่างการใช้งาน Google Ads API:
 *
 * import { GoogleAdsApi } from 'google-ads-api';
 *
 * const client = new GoogleAdsApi({
 *   client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
 *   client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
 *   developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
 * });
 *
 * const customer = client.Customer({
 *   customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
 *   refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
 * });
 *
 * const campaigns = await customer.query(`
 *   SELECT
 *     campaign.id,
 *     campaign.name,
 *     metrics.clicks,
 *     metrics.impressions,
 *     metrics.average_cpc,
 *     metrics.cost_micros
 *   FROM campaign
 *   WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
 * `);
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || "2025-01-01";
    const endDate = searchParams.get("endDate") || "2025-04-04";

    // ตรวจสอบว่ามี credentials อะไรบ้าง
    const credentials = {
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
    };

    const missingCredentials = [];
    if (!credentials.clientId) missingCredentials.push("GOOGLE_ADS_CLIENT_ID");
    if (!credentials.clientSecret)
      missingCredentials.push("GOOGLE_ADS_CLIENT_SECRET");
    if (!credentials.developerToken)
      missingCredentials.push("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!credentials.refreshToken)
      missingCredentials.push("GOOGLE_ADS_REFRESH_TOKEN");
    if (!credentials.customerId)
      missingCredentials.push("GOOGLE_ADS_CUSTOMER_ID");

    // ถ้าขาด credentials ให้ return error พร้อมข้อความชัดเจน
    if (missingCredentials.length > 0) {
      console.error("❌ Missing Google Ads credentials:", missingCredentials);
      return NextResponse.json(
        {
          error: "ยังไม่พร้อมใช้งาน Google Ads API",
          message: "ขาด credentials ดังนี้:",
          missing: missingCredentials,
          instructions: {
            "1. Developer Token":
              "ไปที่ https://ads.google.com/aw/apicenter เพื่อขอ (ใช้เวลา 1-3 วัน)",
            "2. Refresh Token":
              "รัน: node scripts/generate-google-ads-refresh-token.js",
            "3. Customer ID": "ดูที่ Google Ads Dashboard มุมขวาบน",
          },
          currentCredentials: {
            hasClientId: !!credentials.clientId,
            hasClientSecret: !!credentials.clientSecret,
            hasDeveloperToken: !!credentials.developerToken,
            hasRefreshToken: !!credentials.refreshToken,
            hasCustomerId: !!credentials.customerId,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    // ถ้ามี credentials ครบ ให้เชื่อมต่อ API จริง
    console.log(
      "✅ All credentials available. Connecting to Google Ads API..."
    );

    try {
      const { GoogleAdsApi } = require("google-ads-api");

      const client = new GoogleAdsApi({
        client_id: credentials.clientId!,
        client_secret: credentials.clientSecret!,
        developer_token: credentials.developerToken!,
      });

      const customer = client.Customer({
        customer_id: credentials.customerId!.replace(/-/g, ""),
        refresh_token: credentials.refreshToken!,
      });

      console.log("🔍 Querying campaigns from Google Ads API...");

      const campaignsData = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          metrics.clicks,
          metrics.impressions,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status = 'ENABLED'
      `);

      console.log(`✅ Retrieved ${campaignsData.length} campaigns`);

      // แปลงข้อมูลเป็นรูปแบบที่ต้องการ
      const campaigns: GoogleAdsCampaign[] = campaignsData.map((row: any) => ({
        id: row.campaign.id.toString(),
        name: row.campaign.name,
        clicks: row.metrics.clicks || 0,
        impressions: row.metrics.impressions || 0,
        averageCpc: (row.metrics.average_cpc || 0) / 1000000, // Convert micros to THB
        cost: (row.metrics.cost_micros || 0) / 1000000, // Convert micros to THB
        ctr: (row.metrics.ctr || 0) * 100, // Convert to percentage
        conversions: row.metrics.conversions || 0,
      }));

      // คำนวณ summary
      const summary = {
        totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
        totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
        averageCpc:
          campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.averageCpc, 0) /
              campaigns.length
            : 0,
        totalCost: campaigns.reduce((sum, c) => sum + c.cost, 0),
        averageCtr:
          campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length
            : 0,
      };

      const response: GoogleAdsApiResponse = {
        campaigns,
        summary,
        dateRange: {
          startDate,
          endDate,
        },
      };

      return NextResponse.json(response);
    } catch (apiError: any) {
      console.error("❌ Google Ads API Error:", apiError);

      // แสดง error message ที่เป็นประโยชน์
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ Google Ads API";
      let errorDetails = apiError.message || "Unknown error";

      if (errorDetails.includes("PERMISSION_DENIED")) {
        errorMessage = "Developer Token ยังไม่ได้รับอนุมัติ";
        errorDetails =
          "กรุณารอการอนุมัติ Developer Token จาก Google (1-3 วัน) หรือใช้ Test Account";
      } else if (errorDetails.includes("AUTHENTICATION")) {
        errorMessage = "การยืนยันตัวตนล้มเหลว";
        errorDetails =
          "กรุณาตรวจสอบ Client ID, Client Secret และ Refresh Token";
      } else if (errorDetails.includes("CUSTOMER_NOT_FOUND")) {
        errorMessage = "ไม่พบ Customer ID";
        errorDetails = `Customer ID ${credentials.customerId} ไม่ถูกต้อง กรุณาตรวจสอบที่ Google Ads Dashboard`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          credentials: {
            customerId: credentials.customerId,
            developerToken:
              credentials.developerToken?.substring(0, 10) + "...",
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

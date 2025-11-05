// src/app/api/facebook-ads/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Facebook Marketing API Route
 *
 * ดึงข้อมูลแคมเปญจาก Facebook Ads
 */

interface FacebookAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
}

interface FacebookAdsResponse {
  campaigns: FacebookAdsCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    averageCpm: number;
    averageCpc: number;
    averageCtr: number;
    totalConversions: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || "2025-01-01";
    const endDate = searchParams.get("endDate") || "2025-04-04";

    // ตรวจสอบ credentials
    const credentials = {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      adAccountId: process.env.FACEBOOK_AD_ACCOUNT_ID,
    };

    const missingCredentials = [];
    if (!credentials.appId) missingCredentials.push("FACEBOOK_APP_ID");
    if (!credentials.appSecret) missingCredentials.push("FACEBOOK_APP_SECRET");
    if (!credentials.accessToken)
      missingCredentials.push("FACEBOOK_ACCESS_TOKEN");
    if (!credentials.adAccountId)
      missingCredentials.push("FACEBOOK_AD_ACCOUNT_ID");

    if (missingCredentials.length > 0) {
      console.error("❌ Missing Facebook Ads credentials:", missingCredentials);
      return NextResponse.json(
        {
          error: "ยังไม่พร้อมใช้งาน Facebook Ads API",
          message: "ขาด credentials ดังนี้:",
          missing: missingCredentials,
          instructions: {
            "1. สร้าง Facebook App":
              "ไปที่ https://developers.facebook.com/apps/",
            "2. ขอ Access Token": "ใช้ Access Token Tool",
            "3. หา Ad Account ID": "ดูใน Business Manager",
            "4. เพิ่มใน .env.local": "ดูคู่มือใน FACEBOOK_ADS_SETUP.md",
          },
          currentCredentials: {
            hasAppId: !!credentials.appId,
            hasAppSecret: !!credentials.appSecret,
            hasAccessToken: !!credentials.accessToken,
            hasAdAccountId: !!credentials.adAccountId,
          },
        },
        { status: 503 }
      );
    }

    console.log("✅ All Facebook credentials available. Connecting to API...");

    try {
      // Dynamic import to avoid require()
      // @ts-expect-error - no types available for facebook-nodejs-business-sdk
      const bizSdk = await import("facebook-nodejs-business-sdk");
      const AdAccount = bizSdk.AdAccount;
      const Campaign = bizSdk.Campaign;

      // Initialize Facebook Ads API
      const api = bizSdk.FacebookAdsApi.init(credentials.accessToken);

      if (credentials.appSecret) {
        api.setDebug(false);
      }

      const account = new AdAccount(credentials.adAccountId);

      console.log("🔍 Fetching campaigns from Facebook Ads API...");

      // Fetch campaigns with insights
      const campaigns = await account.getCampaigns(
        [
          Campaign.Fields.id,
          Campaign.Fields.name,
          Campaign.Fields.status,
          Campaign.Fields.objective,
        ],
        {
          time_range: {
            since: startDate,
            until: endDate,
          },
        }
      );

      const campaignData: FacebookAdsCampaign[] = [];

      // Fetch insights for each campaign
      for (const campaign of campaigns) {
        try {
          const insights = await campaign.getInsights(
            ["impressions", "clicks", "spend", "cpm", "cpc", "ctr", "actions"],
            {
              time_range: {
                since: startDate,
                until: endDate,
              },
            }
          );

          if (insights && insights.length > 0) {
            const insight = insights[0];

            // หา conversions จาก actions
            let conversions = 0;
            let costPerConversion = 0;

            if (insight.actions) {
              const conversionAction = insight.actions.find(
                (action: any) =>
                  action.action_type === "offsite_conversion.fb_pixel_purchase"
              );
              conversions = conversionAction
                ? parseFloat(conversionAction.value)
                : 0;
            }

            if (conversions > 0 && insight.spend) {
              costPerConversion = parseFloat(insight.spend) / conversions;
            }

            campaignData.push({
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              objective: campaign.objective || "Unknown",
              impressions: parseInt(insight.impressions) || 0,
              clicks: parseInt(insight.clicks) || 0,
              spend: parseFloat(insight.spend) || 0,
              cpm: parseFloat(insight.cpm) || 0,
              cpc: parseFloat(insight.cpc) || 0,
              ctr: parseFloat(insight.ctr) || 0,
              conversions,
              costPerConversion,
            });
          }
        } catch (insightError) {
          console.error(
            `Error fetching insights for campaign ${campaign.id}:`,
            insightError
          );
        }
      }

      console.log(
        `✅ Retrieved ${campaignData.length} campaigns with insights`
      );

      // คำนวณ summary
      const summary = {
        totalImpressions: campaignData.reduce(
          (sum, c) => sum + c.impressions,
          0
        ),
        totalClicks: campaignData.reduce((sum, c) => sum + c.clicks, 0),
        totalSpend: campaignData.reduce((sum, c) => sum + c.spend, 0),
        averageCpm:
          campaignData.length > 0
            ? campaignData.reduce((sum, c) => sum + c.cpm, 0) /
              campaignData.length
            : 0,
        averageCpc:
          campaignData.length > 0
            ? campaignData.reduce((sum, c) => sum + c.cpc, 0) /
              campaignData.length
            : 0,
        averageCtr:
          campaignData.length > 0
            ? campaignData.reduce((sum, c) => sum + c.ctr, 0) /
              campaignData.length
            : 0,
        totalConversions: campaignData.reduce(
          (sum, c) => sum + c.conversions,
          0
        ),
      };

      const response: FacebookAdsResponse = {
        campaigns: campaignData,
        summary,
        dateRange: {
          startDate,
          endDate,
        },
      };

      return NextResponse.json(response);
    } catch (apiError: any) {
      console.error("❌ Facebook Ads API Error:", apiError);

      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ Facebook Ads API";
      let errorDetails = apiError.message || "Unknown error";

      if (errorDetails.includes("access token")) {
        errorMessage = "Access Token ไม่ถูกต้องหรือหมดอายุ";
        errorDetails =
          "กรุณาสร้าง Access Token ใหม่ที่ https://developers.facebook.com/tools/accesstoken/";
      } else if (errorDetails.includes("permissions")) {
        errorMessage = "ไม่มีสิทธิ์เข้าถึง";
        errorDetails =
          "กรุณาตรวจสอบว่า Access Token มี permissions: ads_read, ads_management";
      } else if (errorDetails.includes("account")) {
        errorMessage = "ไม่พบ Ad Account";
        errorDetails = `Ad Account ID ${credentials.adAccountId} ไม่ถูกต้อง กรุณาตรวจสอบใน Business Manager`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          credentials: {
            adAccountId: credentials.adAccountId,
            hasAccessToken: !!credentials.accessToken,
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

import { NextResponse } from "next/server";

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  [k: string]: any;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from") || "2025-01-01";
    const to = url.searchParams.get("to") || "2025-04-04";

    const gaql = `SELECT campaign.id, campaign.name, metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM campaign WHERE segments.date BETWEEN '${from}' AND '${to}'`;

    const {
      GOOGLE_ADS_CLIENT_ID,
      GOOGLE_ADS_CLIENT_SECRET,
      GOOGLE_ADS_REFRESH_TOKEN,
      GOOGLE_ADS_DEVELOPER_TOKEN,
      GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      GOOGLE_ADS_CUSTOMER_ID,
    } = process.env as Record<string, string | undefined>;

    if (
      !GOOGLE_ADS_CLIENT_ID ||
      !GOOGLE_ADS_CLIENT_SECRET ||
      !GOOGLE_ADS_REFRESH_TOKEN ||
      !GOOGLE_ADS_DEVELOPER_TOKEN ||
      !GOOGLE_ADS_CUSTOMER_ID
    ) {
      return NextResponse.json(
        { error: "Missing required Google Ads environment variables" },
        { status: 400 }
      );
    }

    // Exchange refresh token for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_ADS_CLIENT_ID,
        client_secret: GOOGLE_ADS_CLIENT_SECRET,
        refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    const tokenJson = (await tokenRes.json()) as TokenResponse;
    if (!tokenJson.access_token) {
      return NextResponse.json(
        { error: "Failed to obtain access token", details: tokenJson },
        { status: 500 }
      );
    }

    const accessToken = tokenJson.access_token;

    // Call Google Ads search endpoint (non-streaming) with GAQL
    const apiUrl = `https://googleads.googleapis.com/v14/customers/${GOOGLE_ADS_CUSTOMER_ID}/googleAds:search`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "developer-token": GOOGLE_ADS_DEVELOPER_TOKEN,
    };
    if (GOOGLE_ADS_LOGIN_CUSTOMER_ID)
      headers["login-customer-id"] = GOOGLE_ADS_LOGIN_CUSTOMER_ID;

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: gaql, pageSize: 10000 }),
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return NextResponse.json(
        { error: "Google Ads API returned error", status: apiRes.status, text },
        { status: 502 }
      );
    }

    const apiJson = await apiRes.json();

    // Map results into friendly shape. Field names from API responses can vary a bit; adapt after testing if necessary.
    const rows = (apiJson.results || []).map((r: any) => {
      const campaign = r.campaign || {};
      const metrics = r.metrics || {};
      const clicks = Number(metrics.clicks || 0);
      const impressions = Number(metrics.impressions || 0);
      // average_cpc and cost_micros usually come as micros (1e6) — convert to currency units
      const averageCpcMicros = Number(
        metrics.average_cpc || metrics.averageCpc || 0
      );
      const costMicros = Number(metrics.cost_micros || metrics.costMicros || 0);

      return {
        campaignId: campaign.id ?? campaign.resourceName ?? null,
        campaignName: campaign.name ?? null,
        clicks,
        impressions,
        averageCpcMicros,
        averageCpc: averageCpcMicros ? averageCpcMicros / 1_000_000 : 0,
        costMicros,
        cost: costMicros ? costMicros / 1_000_000 : 0,
      };
    });

    // Aggregate totals
    const totals = rows.reduce(
      (acc: any, r: any) => {
        acc.clicks += r.clicks;
        acc.impressions += r.impressions;
        acc.cost += r.cost;
        return acc;
      },
      { clicks: 0, impressions: 0, cost: 0 }
    );

    return NextResponse.json({ rows, totals, gaql });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", message: String(err) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SETSMART_API_KEY = "b206a5c3-1a6c-4871-b1a3-9fbfa0bbc1be";

/**
 * GET /api/stock
 * Proxy endpoint for SETSMART API
 * This helps avoid CORS issues when calling the API directly from the browser
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!symbol || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: symbol, startDate, endDate" },
        { status: 400 }
      );
    }

    const apiUrl = `https://www.setsmart.com/api/listed-company-api/eod-price-by-symbol?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=y`;

    console.log(`🔄 Fetching SETSMART data for ${symbol}...`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "api-key": SETSMART_API_KEY,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ SETSMART API Error: ${response.status}`, errorText);
      throw new Error(`SETSMART API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched data for ${symbol}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Stock API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch stock data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

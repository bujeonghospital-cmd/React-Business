import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/stock
 * Proxy endpoint for SET Market Data API
 * This helps avoid CORS issues when calling the API directly from the browser
 */
export async function GET(request: Request) {
  try {
    // Get optional symbol parameter from query string
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    // Fetch data from SET API
    const response = await fetch(
      "https://marketplace.set.or.th/api/public/realtime-data/stock",
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`SET API returned ${response.status}`);
    }

    const data = await response.json();

    // If specific symbol requested, filter the data
    if (symbol && data.data && Array.isArray(data.data)) {
      const stockData = data.data.find(
        (stock: any) => stock.symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (stockData) {
        return NextResponse.json({ data: [stockData] });
      } else {
        return NextResponse.json(
          { error: `Stock symbol ${symbol} not found` },
          { status: 404 }
        );
      }
    }

    // Return all data if no symbol specified
    return NextResponse.json(data);
  } catch (error) {
    console.error("Stock API Error:", error);

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

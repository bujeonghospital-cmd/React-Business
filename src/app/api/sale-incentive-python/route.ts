import { NextRequest, NextResponse } from "next/server";
// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds
export async function GET(request: NextRequest) {
  try {
    // Get Python API URL from environment or use default
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:5000";
    const saleIncentiveEndpoint = `${pythonApiUrl}/N_SaleIncentive_data`;
    const filmDataEndpoint = `${pythonApiUrl}/api/film-data`;
    // Check cache first
    const cacheKey = "sale-incentive-python-combined";
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && now < cached.expiresAt) {
      console.log(
        `✅ Returning cached N_SaleIncentive + Film Data from Python API`
      );
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "Python API (Cached)",
        },
      });
    }
    console.log(`📡 Fetching N_SaleIncentive + Film Data from Python API...`);
    // Fetch both APIs in parallel
    const [saleIncentiveResponse, filmDataResponse] = await Promise.all([
      fetch(saleIncentiveEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
      }),
      fetch(filmDataEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
      }),
    ]);
    // Process N_SaleIncentive data
    let saleIncentiveData: any[] = [];
    let saleIncentiveCount = 0;
    if (saleIncentiveResponse.ok) {
      const saleData = await saleIncentiveResponse.json();
      if (saleData.success) {
        saleIncentiveData = saleData.data || [];
        saleIncentiveCount = saleData.total_records || 0;
        console.log(`✅ Fetched ${saleIncentiveCount} N_SaleIncentive records`);
      }
    } else {
      console.warn(
        `⚠️ N_SaleIncentive API returned ${saleIncentiveResponse.status}`
      );
    }
    // Process Film Data (Surgery Schedule)
    let filmData: any[] = [];
    let filmDataCount = 0;
    if (filmDataResponse.ok) {
      const surgeryData = await filmDataResponse.json();
      if (surgeryData.success) {
        filmData = surgeryData.data || [];
        filmDataCount = surgeryData.total || 0;
        console.log(`✅ Fetched ${filmDataCount} Film Data records`);
      }
    } else {
      console.warn(`⚠️ Film Data API returned ${filmDataResponse.status}`);
    }
    // If both APIs failed and no cached data, return error
    if (saleIncentiveData.length === 0 && filmData.length === 0 && !cached) {
      return NextResponse.json(
        {
          success: false,
          error: "Both APIs failed to return data",
          data: [],
          sale_incentive_data: [],
          film_data: [],
        },
        { status: 500 }
      );
    }
    // Return cached data if both APIs failed
    if (saleIncentiveData.length === 0 && filmData.length === 0 && cached) {
      console.log("⚠️ Using expired cache due to API errors");
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "X-Cache-Status": "STALE",
          "X-Data-Source": "Python API (Stale Cache)",
        },
      });
    }
    // Combine both datasets
    const transformedData = {
      success: true,
      data: saleIncentiveData, // Main data for revenue calculation
      sale_incentive_data: saleIncentiveData, // Explicit N_SaleIncentive data
      film_data: filmData, // Surgery schedule data
      total_records: saleIncentiveCount,
      sale_incentive_count: saleIncentiveCount,
      film_data_count: filmDataCount,
      timestamp: new Date().toISOString(),
      source: "Python API (Combined: N_SaleIncentive + Film Data)",
    };
    console.log(
      `✅ Combined data: ${saleIncentiveCount} sale incentive + ${filmDataCount} film data records`
    );
    // Update cache with expiration time
    cache.set(cacheKey, {
      data: transformedData,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    });
    // Clean old cache entries
    for (const [key, value] of cache.entries()) {
      if (now > value.expiresAt + 60000) {
        cache.delete(key);
      }
    }
    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-Cache-Status": "MISS",
        "X-Data-Source": "Python API (Fresh - Combined)",
      },
    });
  } catch (error: any) {
    console.error(
      "Error fetching N_SaleIncentive + Film Data from Python API:",
      error
    );
    // Return cached data if available even if expired
    const cached = cache.get("sale-incentive-python-combined");
    if (cached) {
      console.log("⚠️ Using expired cache due to fetch error");
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "X-Cache-Status": "STALE",
          "X-Data-Source": "Python API (Error Fallback)",
        },
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Python API",
        details: {
          type: error.name,
          message: error.message,
          hint: "Make sure Python API is running on the configured URL",
        },
        data: [],
        sale_incentive_data: [],
        film_data: [],
      },
      { status: 500 }
    );
  }
}
// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
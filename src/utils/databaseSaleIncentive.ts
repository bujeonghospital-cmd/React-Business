// Database API Integration for Sale Incentive Data
export interface SaleIncentiveData {
  sale_person: string;
  sale_date: string; // ISO format: "2024-11-19"
  income: number;
  day: number;
  month: number; // 1-12
  year: number;
  customer_name?: string;
  notes?: string;
  data_source?: string;
  is_bjh_count?: number; // 1 if using bjh_all_leads data, 0 if using n_saleIncentive
}
/**
 * Fetch N_SaleIncentive data from Database (via Next.js API route)
 * แทนที่ Python API ที่ดึงจาก Google Sheets
 */
export async function fetchSaleIncentiveFromDatabase(): Promise<
  SaleIncentiveData[]
> {
  try {
    // Check if running on client side
    if (typeof window === "undefined") {
      console.error("fetchSaleIncentiveFromDatabase called on server side");
      return [];
    }
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/sale-incentive-db?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.error) {
        throw new Error(errorData.error);
      }
      throw new Error(
        `ไม่สามารถโหลดข้อมูล Sale Incentive ได้: ${response.statusText}\n\n` +
          "กรุณาตรวจสอบ:\n" +
          "1. Database connection ทำงานปกติ\n" +
          "2. ตาราง sale_incentive มีอยู่ในฐานข้อมูล\n" +
          "3. Environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) ถูกต้อง"
      );
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(
        result.error || "Database API returned unsuccessful response"
      );
    }
    console.log(
      `✅ Successfully fetched ${
        result.total_records || 0
      } Sale Incentive records from Database`
    );
    return result.data || [];
  } catch (error: any) {
    console.error("Error fetching Sale Incentive from Database:", error);
    throw error;
  }
}
/**
 * Calculate daily revenue by person from Sale Incentive data
 * Returns: Map<sale_person, Map<day, total_income>>
 */
export function calculateDailyRevenueByPerson(
  data: SaleIncentiveData[],
  month: number, // 0-11 (JavaScript month)
  year: number
): Map<string, Map<number, number>> {
  const revenueMap = new Map<string, Map<number, number>>();
  let processedCount = 0;
  let matchedCount = 0;
  let totalRevenue = 0;
  let bjhCountUsed = 0;
  let saleIncentiveUsed = 0;
  console.log(`🔍 calculateDailyRevenueByPerson called:`, {
    totalDataLength: data.length,
    targetMonth: month + 1,
    targetYear: year,
    sampleData: data.slice(0, 5).map((d) => ({
      person: d.sale_person,
      month: d.month,
      year: d.year,
      day: d.day,
      income: d.income,
    })),
  });
  data.forEach((item, index) => {
    // Filter by month and year (API returns month as 1-12, convert JS month 0-11 to 1-12)
    if (item.month !== month + 1 || item.year !== year) {
      return;
    }
    processedCount++;
    matchedCount++;
    const person = item.sale_person?.trim() || "ไม่ระบุ";
    const day = item.day;
    const income =
      typeof item.income === "string"
        ? parseFloat(item.income) || 0
        : item.income || 0;
    // Log first few matched records
    if (matchedCount <= 5) {
      console.log(`📝 Matched record #${matchedCount}:`, {
        person,
        day,
        income,
        month: item.month,
        year: item.year,
        is_bjh_count: item.is_bjh_count,
      });
    }
    // Track data source
    if (item.is_bjh_count === 1) {
      bjhCountUsed++;
    } else {
      saleIncentiveUsed++;
    }
    // Initialize map for person if not exists
    if (!revenueMap.has(person)) {
      revenueMap.set(person, new Map<number, number>());
    }
    const personMap = revenueMap.get(person)!;
    // Add income to the day
    const currentRevenue = personMap.get(day) || 0;
    personMap.set(day, currentRevenue + income);
    totalRevenue += income;
  });
  console.log(
    `💰 Calculate Revenue: Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
      month + 1
    }, total revenue: ${totalRevenue.toLocaleString()} บาท | BJH: ${bjhCountUsed}, SaleIncentive: ${saleIncentiveUsed}`
  );
  console.log(`📊 Revenue Map Summary:`, {
    mapSize: revenueMap.size,
    persons: Array.from(revenueMap.keys()),
    sampleRevenue: Array.from(revenueMap.entries())
      .slice(0, 3)
      .map(([person, dayMap]) => ({
        person,
        totalDays: dayMap.size,
        sampleDays: Array.from(dayMap.entries()).slice(0, 3),
      })),
  });
  return revenueMap;
}
/**
 * Map sale person names to contact person mapping used in the app
 */
export const SALE_PERSON_MAPPING: { [key: string]: string } = {
  จีน: "จีน",
  มุก: "มุก",
  เจ: "เจ",
  ว่าน: "ว่าน",
  // Add more mappings if needed
};
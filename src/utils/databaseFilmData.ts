// Database API Integration for Surgery Schedule Data
import { SurgeryScheduleData, CONTACT_PERSON_MAPPING } from "./googleSheets";
/**
 * Fetch surgery schedule data from Database (via Next.js API route)
 * แทนที่ Python API ที่ดึงจาก Google Sheets
 */
export async function fetchSurgeryScheduleFromDatabase(): Promise<
  SurgeryScheduleData[]
> {
  try {
    // Check if running on client side
    if (typeof window === "undefined") {
      console.error("fetchSurgeryScheduleFromDatabase called on server side");
      return [];
    }
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/surgery-schedule-db?t=${timestamp}`, {
      cache: "no-store", // Disable cache
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
        `ไม่สามารถโหลดข้อมูลได้: ${response.statusText}\n\n` +
          "กรุณาตรวจสอบ:\n" +
          "1. Database connection ทำงานปกติ\n" +
          "2. ตาราง surgery_schedule มีอยู่ในฐานข้อมูล\n" +
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
      `✅ Successfully fetched ${result.total || 0} records from Database`
    );
    return result.data || [];
  } catch (error: any) {
    console.error("Error fetching from Database:", error);
    throw error;
  }
}
// Parse date string from Database API (supports various formats)
export function parseDatabaseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  // Clean up the string
  const cleanStr = dateStr.trim();
  try {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const parts = cleanStr.split("-").map(Number);
      const [year, month, day] = parts;
      // Create date at noon local time to avoid timezone issues
      const date = new Date(year, month - 1, day, 12, 0, 0, 0);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Try D/M/YYYY or DD/MM/YYYY format (Thai format - assume DD/MM/YYYY)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
      const parts = cleanStr.split("/").map(Number);
      const [first, second, year] = parts;
      // Assume DD/MM/YYYY format (Thai standard)
      const day = first;
      const month = second;
      // Validate the date
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // Create date at noon local time to avoid timezone issues
        const date = new Date(year, month - 1, day, 12, 0, 0, 0);
        // Double check that the date is valid
        if (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        ) {
          return date;
        }
      }
      return null;
    }
    // Try parsing with built-in Date parser as fallback
    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}
// Count surgeries by date and contact person (for P table - วันที่ได้นัดผ่าตัด)
export function countDatabaseSurgeriesByDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();
  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    countMap.set(person, new Map<number, SurgeryScheduleData[]>());
  });
  let processedCount = 0;
  let matchedCount = 0;
  data.forEach((item) => {
    // ใช้คอลัมน์ P "วันที่ได้นัดผ่าตัด" สำหรับตาราง P
    const surgeryScheduledDate =
      item.date_surgery_scheduled || item.วันที่ได้นัดผ่าตัด || "";
    if (surgeryScheduledDate) {
      processedCount++;
      const date = parseDatabaseDate(surgeryScheduledDate);
      if (date) {
        if (date.getMonth() === month && date.getFullYear() === year) {
          matchedCount++;
          const day = date.getDate();
          // ใช้คอลัมน์ E "ผู้ติดต่อ" จากข้อมูล
          const person =
            (item.contact_person || item.ผู้ติดต่อ || "").trim() || "ไม่ระบุ";
          if (countMap.has(person)) {
            const personMap = countMap.get(person)!;
            if (!personMap.has(day)) {
              personMap.set(day, []);
            }
            personMap.get(day)!.push(item);
          }
        }
      }
    }
  });
  console.log(
    `📊 Count P table (วันที่ได้นัดผ่าตัด): Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
      month + 1
    }`
  );
  return countMap;
}
// Count surgeries by actual surgery date (for L table - วันที่ผ่าตัด)
export function countDatabaseSurgeriesByActualDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();
  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    countMap.set(person, new Map<number, SurgeryScheduleData[]>());
  });
  let processedCount = 0;
  let matchedCount = 0;
  data.forEach((item) => {
    // ใช้ surgery_date หรือ วันที่ผ่าตัด สำหรับตาราง L (วันที่ผ่าตัดจริง)
    const surgeryDate = item.surgery_date || item.วันที่ผ่าตัด || "";
    if (surgeryDate) {
      processedCount++;
      const date = parseDatabaseDate(surgeryDate);
      if (date) {
        if (date.getMonth() === month && date.getFullYear() === year) {
          matchedCount++;
          const day = date.getDate();
          // ใช้ contact_person หรือ ผู้ติดต่อ จากข้อมูล
          const person =
            (item.contact_person || item.ผู้ติดต่อ || "").trim() || "ไม่ระบุ";
          if (countMap.has(person)) {
            const personMap = countMap.get(person)!;
            if (!personMap.has(day)) {
              personMap.set(day, []);
            }
            personMap.get(day)!.push(item);
          }
        }
      }
    }
  });
  console.log(
    `📊 Count L table: Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
      month + 1
    }`
  );
  return countMap;
}
// Get statistics from Database data
export function getDatabaseStatistics(data: SurgeryScheduleData[]) {
  const totalCount = data.length;
  // Count records with surgery scheduled date
  const surgeryCount = data.filter(
    (item) =>
      (item.date_surgery_scheduled || item.วันที่ได้นัดผ่าตัด || "").trim() !==
      ""
  ).length;
  // Count records with consult scheduled date
  const consultCount = data.filter(
    (item) =>
      (item.date_consult_scheduled || item.วันที่ได้นัดผ่าตัด || "").trim() !==
      ""
  ).length;
  // Count records with actual surgery date
  const actualSurgeryCount = data.filter(
    (item) => (item.surgery_date || item.วันที่ผ่าตัด || "").trim() !== ""
  ).length;
  return {
    totalCount,
    surgeryCount,
    consultCount,
    actualSurgeryCount,
  };
}
// Parse amount from string (supports Thai number format)
export function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === "") return 0;
  // Remove all non-numeric characters except decimal point
  const cleanStr = amountStr.replace(/[^\d.]/g, "").trim();
  const amount = parseFloat(cleanStr);
  return isNaN(amount) ? 0 : amount;
}
// Calculate total revenue by date and contact person (for Revenue table)
// ใช้ข้อมูลจาก bjh_all_leads โดยตรง (surgery_date และ proposed_amount)
export function calculateDatabaseRevenueByDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, number>> {
  const revenueMap = new Map<string, Map<number, number>>();
  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    revenueMap.set(person, new Map<number, number>());
  });
  let processedCount = 0;
  let matchedCount = 0;
  let totalRevenue = 0;
  data.forEach((item) => {
    // ใช้ surgery_date (วันที่ผ่าตัดจริง) สำหรับตารางรายรับ
    const surgeryDate = item.surgery_date || item.วันที่ผ่าตัด || "";
    if (surgeryDate) {
      processedCount++;
      const date = parseDatabaseDate(surgeryDate);
      if (date) {
        if (date.getMonth() === month && date.getFullYear() === year) {
          matchedCount++;
          const day = date.getDate();
          // ใช้ contact_staff จากข้อมูล
          const person =
            (item.contact_person || item.ผู้ติดต่อ || "").trim() || "ไม่ระบุ";
          // ใช้ proposed_amount จากข้อมูล (ตัดทศนิยมออก)
          const amountStr = item.ยอดนำเสนอ || "0";
          const amount = Math.floor(parseAmount(amountStr));
          if (amount > 0 && revenueMap.has(person)) {
            const personMap = revenueMap.get(person)!;
            const currentAmount = personMap.get(day) || 0;
            personMap.set(day, currentAmount + amount);
            totalRevenue += amount;
          }
        }
      }
    }
  });
  console.log(
    `💰 Calculate Revenue from bjh_all_leads (surgery_date): Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
      month + 1
    }, total revenue: ${totalRevenue.toLocaleString()} บาท`
  );
  return revenueMap;
}

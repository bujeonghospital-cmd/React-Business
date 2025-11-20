/**
 * Utility functions for Surgery Actual Data (วันที่ผ่าตัดจริง - ตารางที่ 2: L)
 * ดึงข้อมูลจาก PostgreSQL Database ผ่าน /api/surgery-actual-db
 */
import { SurgeryScheduleData } from "./googleSheets";
/**
 * Fetch surgery actual data from database API
 */
export async function fetchSurgeryActualFromDatabase(): Promise<
  SurgeryScheduleData[]
> {
  try {
    const response = await fetch("/api/surgery-actual-db", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch surgery actual data: ${response.statusText}`
      );
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch surgery actual data");
    }
    return result.data as SurgeryScheduleData[];
  } catch (error: any) {
    throw new Error(
      error.message || "Failed to fetch surgery actual data from database"
    );
  }
}
/**
 * Parse date from database (supports YYYY-MM-DD format)
 */
export function parseDatabaseActualDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    // YYYY-MM-DD format from database
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    // DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    }
    // Try ISO format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  } catch (error) {
    return null;
  }
}
/**
 * Count surgeries by actual surgery date (วันที่ผ่าตัดจริง) and contact person
 * สำหรับตารางที่ 2: จำนวนผ่าตัด L
 */
export function countDatabaseActualSurgeriesByDate(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();
  data.forEach((row) => {
    const contactPerson = row.contact_person || row["ผู้ติดต่อ"] || "";
    const surgeryDateStr = row.surgery_date || row["วันที่ผ่าตัด"];
    if (!contactPerson || !surgeryDateStr) return;
    const surgeryDate = parseDatabaseActualDate(surgeryDateStr);
    if (!surgeryDate) return;
    // Check if date matches selected month/year
    if (
      surgeryDate.getMonth() === month &&
      surgeryDate.getFullYear() === year
    ) {
      const day = surgeryDate.getDate();
      if (!countMap.has(contactPerson)) {
        countMap.set(contactPerson, new Map());
      }
      const personMap = countMap.get(contactPerson)!;
      if (!personMap.has(day)) {
        personMap.set(day, []);
      }
      personMap.get(day)!.push(row);
    }
  });
  return countMap;
}
/**
 * Calculate revenue by actual surgery date and contact person
 * สำหรับตารางที่ 2: รายรับจากวันที่ผ่าตัดจริง
 */
export function calculateDatabaseActualRevenue(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, number>> {
  const revenueMap = new Map<string, Map<number, number>>();
  data.forEach((row) => {
    const contactPerson = row.contact_person || row["ผู้ติดต่อ"] || "";
    const surgeryDateStr = row.surgery_date || row["วันที่ผ่าตัด"];
    const proposedAmountStr = row["ยอดนำเสนอ"] || "";
    const proposedAmount = proposedAmountStr
      ? parseFloat(proposedAmountStr.replace(/,/g, ""))
      : 0;
    if (!contactPerson || !surgeryDateStr) return;
    const surgeryDate = parseDatabaseActualDate(surgeryDateStr);
    if (!surgeryDate) return;
    // Check if date matches selected month/year
    if (
      surgeryDate.getMonth() === month &&
      surgeryDate.getFullYear() === year
    ) {
      const day = surgeryDate.getDate();
      if (!revenueMap.has(contactPerson)) {
        revenueMap.set(contactPerson, new Map());
      }
      const personMap = revenueMap.get(contactPerson)!;
      const currentRevenue = personMap.get(day) || 0;
      personMap.set(day, currentRevenue + Number(proposedAmount));
    }
  });
  return revenueMap;
}

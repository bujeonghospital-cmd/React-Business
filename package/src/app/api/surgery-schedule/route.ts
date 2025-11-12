import { google } from "googleapis";
import { NextResponse } from "next/server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Get the month and year from query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Get credentials from environment variables
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!privateKey || !clientEmail || !spreadsheetId) {
      return NextResponse.json(
        {
          error:
            "Missing required environment variables: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_SPREADSHEET_ID",
        },
        { status: 500 }
      );
    }

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Film data!A1:Z1000",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // First row contains headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Debug: Show all headers with their column letters
    console.log("📋 All Headers:");
    headers.forEach((header: string, index: number) => {
      const columnLetter = String.fromCharCode(65 + index); // A=65, B=66, etc.
      console.log(`  ${columnLetter}: "${header}"`);
    });

    // Map column indices
    const columnIndices = {
      หมอ: headers.indexOf("หมอ"),
      ผู้ติดต่อ: headers.indexOf("ผู้ติดต่อ"),
      ชื่อ: headers.indexOf("ชื่อ"),
      เบอร์โทร: headers.indexOf("เบอร์โทร"),
      วันที่ได้นัดผ่าตัด: headers.indexOf("วันที่ได้นัดผ่าตัด"),
      เวลาที่นัด: headers.indexOf("เวลาที่นัด"),
      ยอดนำเสนอ: headers.indexOf("ยอดนำเสนอ"),
      วันที่ผ่าตัด: headers.indexOf("วันที่ผ่าตัด"), // Add L column
    };

    console.log("🔍 Column Indices Found:");
    Object.entries(columnIndices).forEach(([name, index]) => {
      const columnLetter =
        index >= 0 ? String.fromCharCode(65 + index) : "NOT FOUND";
      console.log(`  ${name}: Column ${columnLetter} (index ${index})`);
    });

    // Check required columns (วันที่ผ่าตัด is optional)
    const requiredColumns = [
      "หมอ",
      "ผู้ติดต่อ",
      "ชื่อ",
      "เบอร์โทร",
      "วันที่ได้นัดผ่าตัด",
      "เวลาที่นัด",
      "ยอดนำเสนอ",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => columnIndices[col as keyof typeof columnIndices] === -1
    );

    if (missingColumns.length > 0) {
      console.error("❌ Missing columns:", missingColumns);
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(
            ", "
          )}. Please check your Google Sheet headers.`,
        },
        { status: 400 }
      );
    }

    // Parse data rows
    const scheduleData = dataRows
      .filter(
        (row: any[]) =>
          row[columnIndices.วันที่ได้นัดผ่าตัด] ||
          row[columnIndices.วันที่ผ่าตัด]
      )
      .map((row: any[]) => ({
        หมอ: row[columnIndices.หมอ] || "",
        ผู้ติดต่อ: row[columnIndices.ผู้ติดต่อ] || "",
        ชื่อ: row[columnIndices.ชื่อ] || "",
        เบอร์โทร: row[columnIndices.เบอร์โทร] || "",
        วันที่ได้นัดผ่าตัด: row[columnIndices.วันที่ได้นัดผ่าตัด] || "",
        เวลาที่นัด: row[columnIndices.เวลาที่นัด] || "",
        ยอดนำเสนอ: row[columnIndices.ยอดนำเสนอ] || "",
        วันที่ผ่าตัด: row[columnIndices.วันที่ผ่าตัด] || "", // Add L data
      }));

    console.log(
      `✅ API Route: ส่งข้อมูล ${scheduleData.length} รายการ จากทั้งหมด ${dataRows.length} แถว`
    );

    // Sample first 3 rows for debugging
    console.log("� ตัวอย่างข้อมูล 3 รายการแรก:");
    scheduleData.slice(0, 3).forEach((item: any, idx: number) => {
      console.log(
        `  [${idx + 1}] ชื่อ: "${item.ชื่อ}", ผู้ติดต่อ: "${
          item.ผู้ติดต่อ
        }", วันที่P: "${item.วันที่ได้นัดผ่าตัด}", วันที่L: "${
          item.วันที่ผ่าตัด
        }"`
      );
    });

    return NextResponse.json(
      { data: scheduleData },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching surgery schedule data:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data from Google Sheets",
      },
      { status: 500 }
    );
  }
}

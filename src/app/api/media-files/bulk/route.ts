import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับจัดการ Media Files แบบ Bulk
 *
 * POST /api/media-files/bulk - Bulk operations (delete, favorite, download)
 */

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "IDs array is required" },
        { status: 400 }
      );
    }

    const mediaIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (mediaIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid IDs provided" },
        { status: 400 }
      );
    }

    console.log(`🔄 Bulk ${action} for ${mediaIds.length} files`);

    let result;
    let message: string;

    switch (action) {
      case "delete":
        // Soft delete
        result = await client.query(
          `UPDATE media_files SET is_active = FALSE WHERE id = ANY($1) AND is_active = TRUE RETURNING id`,
          [mediaIds]
        );
        message = `${result.rowCount} files deleted`;
        break;

      case "favorite":
        // Add to favorites
        result = await client.query(
          `UPDATE media_files SET is_favorite = TRUE WHERE id = ANY($1) AND is_active = TRUE RETURNING id`,
          [mediaIds]
        );
        message = `${result.rowCount} files added to favorites`;
        break;

      case "unfavorite":
        // Remove from favorites
        result = await client.query(
          `UPDATE media_files SET is_favorite = FALSE WHERE id = ANY($1) AND is_active = TRUE RETURNING id`,
          [mediaIds]
        );
        message = `${result.rowCount} files removed from favorites`;
        break;

      case "get":
        // Get files for download
        result = await client.query(
          `SELECT id, name, file_url, file_base64, mime_type FROM media_files WHERE id = ANY($1) AND is_active = TRUE`,
          [mediaIds]
        );

        // Update download count
        await client.query(
          `UPDATE media_files SET download_count = download_count + 1 WHERE id = ANY($1)`,
          [mediaIds]
        );

        return NextResponse.json({
          success: true,
          data: result.rows,
          total: result.rowCount,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    console.log(`✅ ${message}`);

    return NextResponse.json({
      success: true,
      message,
      affectedCount: result.rowCount,
      affectedIds: result.rows.map((r: any) => r.id),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in bulk operation:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับจัดการ Media File รายตัว
 *
 * GET /api/media-files/[id] - ดึงข้อมูลไฟล์เดียว
 * PUT /api/media-files/[id] - อัพเดทข้อมูลไฟล์
 * DELETE /api/media-files/[id] - ลบไฟล์
 */

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - ดึงข้อมูล Media File รายตัว
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: "Invalid media ID" },
        { status: 400 }
      );
    }

    console.log(`🔄 Fetching media file ID: ${mediaId}`);

    // Update view count
    await client.query(
      "UPDATE media_files SET view_count = view_count + 1 WHERE id = $1",
      [mediaId]
    );

    const query = `
      SELECT 
        m.*,
        COALESCE(
          ARRAY_AGG(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), 
          ARRAY[]::VARCHAR[]
        ) as tags
      FROM media_files m
      LEFT JOIN media_tags t ON m.id = t.media_id
      WHERE m.id = $1 AND m.is_active = TRUE
      GROUP BY m.id
    `;

    const result = await client.query(query, [mediaId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Media file not found" },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    const mediaFile = {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.file_type,
      url: row.file_url,
      thumbnail: row.thumbnail_base64 || row.file_url,
      thumbnailBase64: row.thumbnail_base64,
      fileBase64: row.file_base64,
      mimeType: row.mime_type,
      size: row.file_size_display || formatFileSize(row.file_size),
      sizeBytes: row.file_size,
      duration: row.duration,
      durationSeconds: row.duration_seconds,
      width: row.width,
      height: row.height,
      category: row.category_name,
      favorite: row.is_favorite,
      views: row.view_count,
      downloads: row.download_count,
      likes: row.like_count,
      uploadedBy: row.uploaded_by_name,
      date: formatDate(row.created_at),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: row.tags,
    };

    console.log(`✅ Found media file: ${mediaFile.name}`);

    return NextResponse.json({
      success: true,
      data: mediaFile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching media file:", error);

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

// PUT - อัพเดทข้อมูล Media File
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: "Invalid media ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    console.log(`📝 Updating media file ID: ${mediaId}`);

    await client.query("BEGIN");

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      "name",
      "description",
      "file_url",
      "thumbnail_base64",
      "file_base64",
      "mime_type",
      "file_size",
      "duration",
      "duration_seconds",
      "width",
      "height",
      "category_name",
      "is_favorite",
      "is_public",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    // Handle file_size_display
    if (body.file_size !== undefined) {
      updates.push(`file_size_display = $${paramIndex}`);
      values.push(formatFileSize(body.file_size));
      paramIndex++;
    }

    if (updates.length === 0 && !body.tags) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    if (updates.length > 0) {
      const updateQuery = `
        UPDATE media_files 
        SET ${updates.join(", ")}
        WHERE id = $${paramIndex} AND is_active = TRUE
        RETURNING id
      `;
      values.push(mediaId);

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, error: "Media file not found" },
          { status: 404 }
        );
      }
    }

    // Update tags if provided
    if (body.tags && Array.isArray(body.tags)) {
      // Delete existing tags
      await client.query("DELETE FROM media_tags WHERE media_id = $1", [
        mediaId,
      ]);

      // Insert new tags
      if (body.tags.length > 0) {
        const tagValues = body.tags
          .map((_: string, index: number) => `($1, $${index + 2})`)
          .join(", ");

        const tagQuery = `
          INSERT INTO media_tags (media_id, tag_name)
          VALUES ${tagValues}
        `;

        await client.query(tagQuery, [mediaId, ...body.tags]);
      }
    }

    await client.query("COMMIT");

    console.log(`✅ Media file updated successfully`);

    return NextResponse.json({
      success: true,
      message: "Media file updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error updating media file:", error);

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

// DELETE - ลบ Media File (Soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: "Invalid media ID" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting media file ID: ${mediaId}`);

    // Soft delete
    const result = await client.query(
      `UPDATE media_files SET is_active = FALSE WHERE id = $1 AND is_active = TRUE RETURNING id, name`,
      [mediaId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Media file not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Media file deleted: ${result.rows[0].name}`);

    return NextResponse.json({
      success: true,
      message: "Media file deleted successfully",
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error deleting media file:", error);

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

// Helper Functions
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(date: string | Date | null): string {
  if (!date) return new Date().toISOString().split("T")[0];

  if (typeof date === "string") {
    return date.split("T")[0];
  }

  return date.toISOString().split("T")[0];
}

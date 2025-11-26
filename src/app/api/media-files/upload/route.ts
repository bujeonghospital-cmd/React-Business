import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับ Upload Media Files พร้อมแปลงเป็น Base64
 *
 * POST /api/media-files/upload - Upload file และแปลงเป็น Base64
 */

// Maximum file size (10MB for images, 50MB for videos)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string | null;
    const tags = formData.get("tags") as string | null; // comma separated
    const uploadedBy = formData.get("uploadedBy") as string | null;
    const uploadedByName = formData.get("uploadedByName") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    // Determine file type
    const mimeType = file.type;
    let fileType: "image" | "video" | "clip";
    let maxSize: number;

    if (mimeType.startsWith("image/")) {
      fileType = "image";
      maxSize = MAX_IMAGE_SIZE;
    } else if (mimeType.startsWith("video/")) {
      // Check duration later to determine if it's a clip
      fileType = "video";
      maxSize = MAX_VIDEO_SIZE;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Only images and videos are allowed.",
        },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${formatFileSize(maxSize)}`,
        },
        { status: 400 }
      );
    }

    console.log(
      `📤 Uploading file: ${file.name} (${formatFileSize(file.size)})`
    );

    // Convert file to Base64
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = `data:${mimeType};base64,${Buffer.from(
      fileBuffer
    ).toString("base64")}`;

    // Convert thumbnail to Base64 if provided
    let thumbnailBase64: string | null = null;
    if (thumbnailFile) {
      const thumbBuffer = await thumbnailFile.arrayBuffer();
      thumbnailBase64 = `data:${thumbnailFile.type};base64,${Buffer.from(
        thumbBuffer
      ).toString("base64")}`;
    } else if (fileType === "image") {
      // Use the image itself as thumbnail for images
      thumbnailBase64 = fileBase64;
    }

    await client.query("BEGIN");

    // Insert into database
    const insertQuery = `
      INSERT INTO media_files (
        name,
        description,
        file_type,
        thumbnail_base64,
        file_base64,
        mime_type,
        file_size,
        file_size_display,
        category_name,
        uploaded_by,
        uploaded_by_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const fileName = name || file.name;

    const result = await client.query(insertQuery, [
      fileName,
      description || null,
      fileType,
      thumbnailBase64,
      fileBase64,
      mimeType,
      file.size,
      formatFileSize(file.size),
      category || null,
      uploadedBy ? parseInt(uploadedBy) : null,
      uploadedByName || null,
    ]);

    const mediaId = result.rows[0].id;

    // Insert tags if provided
    if (tags) {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      if (tagList.length > 0) {
        const tagValues = tagList
          .map((_, index) => `($1, $${index + 2})`)
          .join(", ");

        const tagQuery = `
          INSERT INTO media_tags (media_id, tag_name)
          VALUES ${tagValues}
          ON CONFLICT (media_id, tag_name) DO NOTHING
        `;

        await client.query(tagQuery, [mediaId, ...tagList]);
      }
    }

    await client.query("COMMIT");

    console.log(`✅ File uploaded successfully with ID: ${mediaId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: mediaId,
        name: fileName,
        type: fileType,
        size: formatFileSize(file.size),
        mimeType,
      },
      message: "File uploaded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error uploading file:", error);

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

// Helper function
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

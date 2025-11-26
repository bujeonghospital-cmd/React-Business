import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับจัดการ Favorite Media Files
 *
 * POST /api/media-files/favorite - Toggle Favorite
 */

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { id, favorite } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: "Invalid media ID" },
        { status: 400 }
      );
    }

    console.log(`⭐ Toggling favorite for media ID: ${mediaId}`);

    let query: string;
    let params: any[];

    if (favorite !== undefined) {
      // Set specific value
      query = `
        UPDATE media_files 
        SET is_favorite = $1
        WHERE id = $2 AND is_active = TRUE
        RETURNING id, name, is_favorite
      `;
      params = [favorite, mediaId];
    } else {
      // Toggle
      query = `
        UPDATE media_files 
        SET is_favorite = NOT is_favorite
        WHERE id = $1 AND is_active = TRUE
        RETURNING id, name, is_favorite
      `;
      params = [mediaId];
    }

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Media file not found" },
        { status: 404 }
      );
    }

    const { name, is_favorite } = result.rows[0];

    console.log(`✅ Favorite ${is_favorite ? "added" : "removed"}: ${name}`);

    return NextResponse.json({
      success: true,
      data: {
        id: mediaId,
        name,
        favorite: is_favorite,
      },
      message: is_favorite ? "Added to favorites" : "Removed from favorites",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error toggling favorite:", error);

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

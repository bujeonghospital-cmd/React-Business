import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับจัดการ Media Categories
 *
 * GET /api/media-files/categories - ดึงหมวดหมู่ทั้งหมด
 * POST /api/media-files/categories - สร้างหมวดหมู่ใหม่
 */

// GET - ดึงหมวดหมู่ทั้งหมด
export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    console.log("🔄 Fetching media categories...");

    const query = `
      SELECT 
        mc.id,
        mc.name,
        mc.description,
        mc.created_at,
        COUNT(mf.id) as file_count
      FROM media_categories mc
      LEFT JOIN media_files mf ON mf.category_name = mc.name AND mf.is_active = TRUE
      GROUP BY mc.id
      ORDER BY mc.name ASC
    `;

    const result = await client.query(query);

    console.log(`✅ Found ${result.rows.length} categories`);

    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      fileCount: parseInt(row.file_count),
      createdAt: row.created_at,
    }));

    // Also get categories from media_files that might not be in media_categories
    const uniqueCategoriesQuery = `
      SELECT DISTINCT category_name, COUNT(*) as file_count
      FROM media_files
      WHERE is_active = TRUE AND category_name IS NOT NULL
      GROUP BY category_name
      ORDER BY category_name ASC
    `;

    const uniqueResult = await client.query(uniqueCategoriesQuery);

    const allCategories = uniqueResult.rows.map((row) => ({
      name: row.category_name,
      fileCount: parseInt(row.file_count),
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories,
        allCategories,
      },
      total: categories.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);

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

// POST - สร้างหมวดหมู่ใหม่
export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    console.log(`📁 Creating new category: ${name}`);

    const query = `
      INSERT INTO media_categories (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE SET description = $2
      RETURNING id, name, description
    `;

    const result = await client.query(query, [name, description || null]);

    console.log(`✅ Category created/updated: ${name}`);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Category created successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error creating category:", error);

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

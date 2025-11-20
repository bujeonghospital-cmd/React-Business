import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      name,
      lname,
      email,
      username,
      password,
      phone,
      department,
      position,
    } = body;
    // Validate required fields
    if (!name || !lname || !email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
        },
        { status: 400 }
      );
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "รูปแบบอีเมลไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, 0-9 และ _",
        },
        { status: 400 }
      );
    }
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }
    // Check if email already exists
    const emailCheckQuery = `
      SELECT id FROM "BJH-Server"."user" 
      WHERE email = $1 AND delete_date IS NULL
      LIMIT 1
    `;
    const emailCheck = await client.query(emailCheckQuery, [email]);
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        },
        { status: 409 }
      );
    }
    // Check if username already exists
    const usernameCheckQuery = `
      SELECT id FROM "BJH-Server"."user" 
      WHERE username = $1 AND delete_date IS NULL
      LIMIT 1
    `;
    const usernameCheck = await client.query(usernameCheckQuery, [username]);
    if (usernameCheck.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว",
        },
        { status: 409 }
      );
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Get default role (user role)
    const roleQuery = `
      SELECT id_role FROM "BJH-Server".roles 
      WHERE tag = 'user' 
      LIMIT 1
    `;
    const roleResult = await client.query(roleQuery);
    const defaultRoleId = roleResult.rows[0]?.id_role || null;
    console.log("📝 Preparing to insert user with data:", {
      name,
      lname,
      email,
      username,
      phone: phone || null,
      department: department || null,
      position: position || null,
      defaultRoleId,
    });
    // Insert new user
    const insertUserQuery = `
      INSERT INTO "BJH-Server"."user" (
        name, 
        lname, 
        email, 
        username, 
        password,
        phone,
        id_dep,
        position,
        id_role,
        status_rank,
        admin,
        create_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING id, name, lname, email, username, phone, id_dep, position
    `;
    console.log("🔍 Insert query:", insertUserQuery);
    console.log("🔍 Query parameters:", [
      name,
      lname,
      email,
      username,
      "(password hashed)",
      phone || null,
      department || null,
      position || null,
      defaultRoleId,
      "user",
      false,
    ]);
    const userResult = await client.query(insertUserQuery, [
      name,
      lname,
      email,
      username,
      hashedPassword,
      phone || null,
      department || null,
      position || null,
      defaultRoleId,
      "user", // status_rank
      false, // admin
    ]);
    const newUser = userResult.rows[0];
    console.log("✅ New user registered:", newUser.username);
    return NextResponse.json({
      success: true,
      message: `สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${name}`,
      user: {
        id: newUser.id,
        name: newUser.name,
        lname: newUser.lname,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง",
        error: error.message,
        detail: error.detail,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
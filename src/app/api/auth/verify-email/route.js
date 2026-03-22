import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    // Find user by token
    const [users] = await pool.query("SELECT id, verify_token FROM users WHERE is_verified = 0");

    let userId = null;

    for (const user of users) {
      const isMatch = await bcrypt.compare(token, user.verify_token);
      if (isMatch) {
        userId = user.id;
        break;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Mark user as verified
    await pool.query(
      "UPDATE users SET is_verified = 1, verify_token = NULL WHERE id = ?",
      [userId]
    );

    return NextResponse.json(
      { message: "Email verified successfully! You can now login." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}

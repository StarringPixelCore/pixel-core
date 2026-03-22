import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { validateLoginForm } from "@/lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate inputs
    const errors = validateLoginForm({ email, password });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Find user by email
    const [users] = await pool.query(
      "SELECT id, password, first_name, last_name, email, role, is_verified FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { errors: { email: "Email or password is incorrect" } },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if email is verified
    if (!user.is_verified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { errors: { password: "Email or password is incorrect" } },
        { status: 401 }
      );
    }

    // Create response with session cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set session cookie (httpOnly, secure, sameSite)
    response.cookies.set("session", JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

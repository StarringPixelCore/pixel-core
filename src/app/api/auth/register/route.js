import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "@/lib/db";
import { validateRegisterForm } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, password, confirmPassword, address, mobileNumber } = body;

    // Frontend validation (also validate on backend)
    const errors = validateRegisterForm({
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      address,
      mobileNumber,
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { errors: { email: "Email already registered" } },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(verifyToken, 10);

    // Insert user into database
    const [result] = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password, address, mobile_number, verify_token, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [email, firstName, lastName, hashedPassword, address, mobileNumber, tokenHash]
    );

    const userId = result.insertId;

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verifyToken);

    if (!emailResult.success) {
      // Optionally delete the user if email fails to send
      await pool.query("DELETE FROM users WHERE id = ?", [userId]);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Registration successful! Please check your email to verify your account.",
        userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

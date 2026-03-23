import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req) {
  try {
    const sessionCookie = req.cookies.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    // Fetch user data
    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, address, mobile_number, role, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const user = users[0];

    const normalizedProfilePicture = user.profile_picture
      ? user.profile_picture === 'default.jpg' || user.profile_picture === 'public/images/default.jpg'
        ? '/images/default.jpg'
        : user.profile_picture
      : '/images/default.jpg';

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        address: user.address,
        mobileNumber: user.mobile_number,
        role: user.role,
        profilePicture: normalizedProfilePicture,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

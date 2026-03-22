import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}

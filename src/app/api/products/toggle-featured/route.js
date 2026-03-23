import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // Verify user is a seller
    if (sessionData.role !== "Seller") {
      return NextResponse.json(
        { success: false, message: "Only sellers can update featured products" },
        { status: 403 }
      );
    }

    const { productId, isFeatured } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await pool.query(
      "UPDATE products SET isHomepageFeatured = ? WHERE id = ?",
      [isFeatured ? 1 : 0, productId]
    );

    return NextResponse.json({
      success: true,
      message: isFeatured
        ? "Product featured on homepage"
        : "Product removed from homepage",
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function DELETE(req) {
  try {
    const session = getSessionUser(req);
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Please log in to clear cart" },
        { status: 401 }
      );
    }
    const userId = session.userId;

    const [cartRows] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (cartRows.length > 0) {
      await pool.query("DELETE FROM cart_items WHERE cart_id = ?", [
        cartRows[0].id,
      ]);
    }

    return NextResponse.json({ message: "Cart cleared" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
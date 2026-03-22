import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function DELETE(req) {
  try {
    const session = getSessionUser(req);
    const userId = session?.userId ?? 1;

    const { itemId } = await req.json();

    const [result] = await pool.query(
      "DELETE ci FROM cart_items ci INNER JOIN cart c ON c.id = ci.cart_id WHERE ci.id = ? AND c.user_id = ?",
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item removed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
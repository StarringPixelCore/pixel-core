import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function PUT(req) {
  try {
    const session = getSessionUser(req);
    const userId = session?.userId ?? 1;

    const { itemId, action } = await req.json();

    const [rows] = await pool.query(
      "SELECT ci.* FROM cart_items ci INNER JOIN cart c ON c.id = ci.cart_id WHERE ci.id = ? AND c.user_id = ? LIMIT 1",
      [itemId, userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = rows[0];

    if (action === "increase") {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?",
        [itemId]
      );
    } else if (action === "decrease") {
      if (item.quantity <= 1) {
        await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);
      } else {
        await pool.query(
          "UPDATE cart_items SET quantity = quantity - 1 WHERE id = ?",
          [itemId]
        );
      }
    }

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
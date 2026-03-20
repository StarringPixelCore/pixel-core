import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req) {
  try {
    const { itemId, action } = await req.json();

    const [rows] = await pool.query(
      "SELECT * FROM cart_items WHERE id = ? LIMIT 1",
      [itemId]
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
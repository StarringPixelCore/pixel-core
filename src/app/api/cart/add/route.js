import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const userId = 1; // temporary
    const { productId, price } = await req.json();

    let [cartRows] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? LIMIT 1",
      [userId]
    );

    let cartId;

    if (cartRows.length === 0) {
      const [newCart] = await pool.query(
        "INSERT INTO cart (user_id) VALUES (?)",
        [userId]
      );
      cartId = newCart.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    const [existing] = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
      [cartId, productId]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?",
        [existing[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, 1, ?)",
        [cartId, productId, price]
      );
    }

    return NextResponse.json({ message: "Item added to cart" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
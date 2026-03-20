import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const userId = 1; // temporary hardcoded user

    const [cartRows] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (cartRows.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const cartId = cartRows[0].id;

    const [items] = await pool.query(
      `
      SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        ci.price,
        p.name,
        p.category,
        p.image
      FROM tblcart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      `,
      [cartId]
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}
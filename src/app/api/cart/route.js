import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(req) {
  try {
    const session = getSessionUser(req);
    const userId = session?.userId ?? 1;

    const [cartRows] = await pool.query(
      "SELECT id FROM cart WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (cartRows.length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const cartId = cartRows[0].id;

    const [items] = await pool.query(
      `
      SELECT
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        ci.price,
        p.name,
        p.description,
        p.badge,
        p.category,
        p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.added_at DESC
      `,
      [cartId]
    );

    const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);

    return NextResponse.json({ items, count });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
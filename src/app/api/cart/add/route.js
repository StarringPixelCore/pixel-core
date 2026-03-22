import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(req) {
  try {
    const session = getSessionUser(req);
    const userId = session?.userId ?? 1;
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    const [productRows] = await pool.query(
      "SELECT id, price FROM products WHERE id = ? LIMIT 1",
      [productId]
    );

    if (productRows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = productRows[0];

    let [cartRows] = await pool.query(
      "SELECT id FROM cart WHERE user_id = ? LIMIT 1",
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

    const [existingItems] = await pool.query(
      "SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
      [cartId, productId]
    );

    if (existingItems.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?",
        [existingItems[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, 1, ?)",
        [cartId, productId, product.price]
      );
    }

    return NextResponse.json({ message: "Item added to cart" });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
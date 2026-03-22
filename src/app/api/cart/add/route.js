import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const userId = 1; // temporary until login is added
    const { productId } = await req.json();

    const [productRows] = await pool.query(
      "SELECT id, price, stock FROM products WHERE id = ? LIMIT 1",
      [productId]
    );

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productRows[0];

    if (product.stock <= 0) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 });
    }

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

    const [existingItems] = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
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
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
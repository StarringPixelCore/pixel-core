import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

async function requireSeller(req) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users] = await pool.query(
    "SELECT role FROM users WHERE id = ? LIMIT 1",
    [session.userId]
  );

  if (users.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (users[0].role !== "Seller") {
    return NextResponse.json(
      { error: "Only sellers can manage inventory" },
      { status: 403 }
    );
  }

  return null;
}

export async function POST(req, context) {
  try {
    const sellerError = await requireSeller(req);
    if (sellerError) return sellerError;

    const params = await context.params;
    const productId = Number(params.id);
    if (!Number.isInteger(productId) || productId < 1) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, description, price, badge, category, image_url } = body || {};

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    const safeBadge = typeof badge === "string" ? badge : "";
    const safeDescription = typeof description === "string" ? description : "";
    const safeCategory = typeof category === "string" ? category : null;
    const safeImageUrl =
      typeof image_url === "string" && image_url.trim() ? image_url : null;

    const [updateResult] = await pool.query(
      `
        UPDATE products
        SET
          name = ?,
          description = ?,
          price = ?,
          badge = ?,
          category = ?,
          image_url = ?
        WHERE id = ?
      `,
      [
        name,
        safeDescription,
        parsedPrice,
        safeBadge,
        safeCategory,
        safeImageUrl,
        productId,
      ]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          description,
          price,
          badge,
          category,
          image_url,
          isEnabled,
          isHomepageFeatured,
          isBestSeller,
          created_at
        FROM products
        WHERE id = ?
        LIMIT 1
      `,
      [productId]
    );

    const product = rows[0];
    return NextResponse.json({
      success: true,
      message: "Product updated",
      product: { ...product, badge: product.badge || "" },
    });
  } catch (error) {
    console.error("POST UPDATE INVENTORY ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}


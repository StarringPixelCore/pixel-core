import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { validateProductForm } from "@/lib/validation";

function getSellerFromSession(req) {
  const session = getSessionUser(req);
  return session;
}

async function requireSeller(req) {
  const session = getSellerFromSession(req);
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

export async function GET(req) {
  try {
    const sellerError = await requireSeller(req);
    if (sellerError) return sellerError;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 5;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total FROM products
    `);
    const total = countResult[0].total;

    // Get paginated products
    const [rows] = await pool.query(`
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
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const products = rows.map((p) => ({
      ...p,
      badge: p.badge || "",
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("GET SELLER INVENTORY ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const sellerError = await requireSeller(req);
    if (sellerError) return sellerError;

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

    // Validate form
    const errors = validateProductForm({ name, description, price, badge, category, image_url });
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Remove the old validation
    // if (!name || typeof name !== "string") {
    //   return NextResponse.json({ error: "Name is required" }, { status: 400 });
    // }

    // const parsedPrice = Number(price);
    // if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    //   return NextResponse.json(
    //     { error: "Valid price is required" },
    //     { status: 400 }
    //   );
    // }

    const safeBadge = typeof badge === "string" ? badge : "";
    const safeDescription = typeof description === "string" ? description : "";
    const safeCategory = typeof category === "string" ? category : null;
    const safeImageUrl =
      typeof image_url === "string" && image_url.trim() ? image_url : null;

    const [result] = await pool.query(
      `
        INSERT INTO products (name, description, price, badge, category, image_url, isEnabled)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      [name.trim(), safeDescription.trim(), Number(price), safeBadge.trim(), safeCategory?.trim() || null, safeImageUrl?.trim() || null]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ? LIMIT 1", [
      insertedId,
    ]);

    const product = rows[0];
    return NextResponse.json({
      success: true,
      message: "Product created",
      product: {
        ...product,
        badge: product.badge || "",
      },
    });
  } catch (error) {
    console.error("POST CREATE INVENTORY ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}


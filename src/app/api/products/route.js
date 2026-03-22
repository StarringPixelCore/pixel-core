import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, description, price, category, image_url
      FROM products
      ORDER BY created_at DESC
    `);

    // Add badge field for component compatibility
    const products = rows.map(product => ({
      ...product,
      badge: ''
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
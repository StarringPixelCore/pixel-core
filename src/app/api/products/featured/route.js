import pool from "@/lib/db";

export async function GET(req) {
  try {
    const query = `
      SELECT id, name, description, price, badge, category, image_url, isBestSeller, isHomepageFeatured
      FROM products
      WHERE isHomepageFeatured = 1
      AND isEnabled = 1
      ORDER BY isBestSeller DESC, id DESC
      LIMIT 12
    `;

    const [products] = await pool.query(query);

    return Response.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return Response.json(
      { success: false, error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}

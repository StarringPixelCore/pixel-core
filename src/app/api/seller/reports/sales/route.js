import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

function requireSeller(req) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

async function requireSellerRole(session) {
  const [users] = await pool.query("SELECT role FROM users WHERE id = ? LIMIT 1", [
    session.userId,
  ]);

  if (users.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (users[0].role !== "Seller") {
    return NextResponse.json({ error: "Only sellers can access reports" }, { status: 403 });
  }

  return null;
}

function getRangeBounds(range) {
  const now = new Date();

  if (range === "day") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const endExclusive = new Date(start);
    endExclusive.setDate(endExclusive.getDate() + 1);
    return { start, endExclusive };
  }

  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const endExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, endExclusive };
}

export async function GET(req) {
  try {
    const session = requireSeller(req);
    if (session instanceof NextResponse) return session;

    const roleError = await requireSellerRole(session);
    if (roleError) return roleError;

    const url = new URL(req.url);
    const range = url.searchParams.get("range");
    const safeRange = range === "month" ? "month" : "day";

    const { start, endExclusive } = getRangeBounds(safeRange);

    const [salesRows] = await pool.query(
      `
        SELECT
          o.id,
          o.created_at,
          u.first_name,
          u.last_name,
          u.email,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.total_amount,
          (
            SELECT tr.reference_number
            FROM transactions tr
            WHERE tr.order_id = o.id AND tr.transaction_type = 'purchase'
            ORDER BY tr.created_at DESC
            LIMIT 1
          ) AS reference_number,
          (
            SELECT
              GROUP_CONCAT(
                CONCAT(oi.product_name, ' (x', oi.quantity, ')')
                SEPARATOR ', '
              )
            FROM order_items oi
            WHERE oi.order_id = o.id
          ) AS items_summary
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.created_at >= ?
          AND o.created_at < ?
          AND o.payment_status = 'paid'
          AND o.order_status = 'delivered'
        ORDER BY o.created_at DESC
      `,
      [start, endExclusive]
    );

    const [totalsRows] = await pool.query(
      `
        SELECT
          COALESCE(SUM(o.total_amount), 0) AS total_sales,
          COUNT(*) AS order_count
        FROM orders o
        WHERE o.created_at >= ?
          AND o.created_at < ?
          AND o.payment_status = 'paid'
          AND o.order_status = 'delivered'
      `,
      [start, endExclusive]
    );

    const totalSales = Number(totalsRows?.[0]?.total_sales || 0);
    const orderCount = Number(totalsRows?.[0]?.order_count || 0);

    const sales = (salesRows || []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      buyer: {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
      },
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      orderStatus: row.order_status,
      totalAmount: row.total_amount,
      referenceNumber: row.reference_number,
      itemsSummary: row.items_summary,
    }));

    return NextResponse.json({
      success: true,
      data: {
        range: safeRange,
        startAt: start.toISOString(),
        // Convert exclusive boundary to inclusive end for UI display.
        endAt: new Date(endExclusive.getTime() - 1).toISOString(),
        totalSales,
        orderCount,
        sales,
      },
    });
  } catch (error) {
    console.error("GET SELLER REPORT SALES ERROR:", error);
    return NextResponse.json({ error: "Failed to load sales report" }, { status: 500 });
  }
}


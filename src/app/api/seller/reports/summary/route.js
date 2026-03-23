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

    const [rows] = await pool.query(
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

    return NextResponse.json({
      success: true,
      data: {
        range: safeRange,
        totalSales: Number(rows[0]?.total_sales || 0),
        orderCount: Number(rows[0]?.order_count || 0),
        startAt: start.toISOString(),
        // Convert exclusive boundary to inclusive end for UI display.
        endAt: new Date(endExclusive.getTime() - 1).toISOString(),
      },
    });
  } catch (error) {
    console.error("GET SELLER REPORT SUMMARY ERROR:", error);
    return NextResponse.json({ error: "Failed to load report summary" }, { status: 500 });
  }
}


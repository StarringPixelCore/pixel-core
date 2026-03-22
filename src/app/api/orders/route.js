import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { mapOrderRow, mapItemRow } from "@/lib/ordersMappers";

export async function GET(req) {
  try {
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

    if (users[0].role !== "Buyer") {
      return NextResponse.json(
        { error: "Order history is only available for buyers" },
        { status: 403 }
      );
    }

    const [orderRows] = await pool.query(
      `
      SELECT
        id, user_id, receive_method, delivery_address, payment_method, payment_status,
        order_status, subtotal, shipping_fee, total_amount, notes, created_at, updated_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [session.userId]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = orderRows.map((o) => o.id);

    const [itemRows] = await pool.query(
      `
      SELECT id, order_id, product_id, product_name, product_image, quantity, unit_price, subtotal
      FROM order_items
      WHERE order_id IN (?)
      ORDER BY id ASC
      `,
      [orderIds]
    );

    const [txnRows] = await pool.query(
      `
      SELECT order_id, reference_number
      FROM transactions
      WHERE order_id IN (?) AND transaction_type = 'purchase'
      `,
      [orderIds]
    );

    const refByOrder = {};
    for (const t of txnRows) {
      if (!refByOrder[t.order_id]) {
        refByOrder[t.order_id] = t.reference_number;
      }
    }

    const itemsByOrder = {};
    for (const row of itemRows) {
      const oid = row.order_id;
      if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
      itemsByOrder[oid].push(mapItemRow(row));
    }

    const orders = orderRows.map((row) => ({
      ...mapOrderRow(row),
      referenceNumber: refByOrder[row.id] || null,
      items: itemsByOrder[row.id] || [],
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}

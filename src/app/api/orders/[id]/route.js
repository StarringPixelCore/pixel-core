import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  mapOrderRow,
  mapItemRow,
  mapPaymentDetailRow,
  mapTransactionRow,
} from "@/lib/ordersMappers";

export async function GET(req, context) {
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
        { error: "Orders are only available for buyers" },
        { status: 403 }
      );
    }

    const params = await context.params;
    const orderId = Number(params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const [orderRows] = await pool.query(
      `
      SELECT
        id, user_id, receive_method, delivery_address, payment_method, payment_status,
        order_status, subtotal, shipping_fee, total_amount, notes, created_at, updated_at
      FROM orders
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [orderId, session.userId]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const [itemRows] = await pool.query(
      `
      SELECT id, order_id, product_id, product_name, product_image, quantity, unit_price, subtotal
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
      `,
      [orderId]
    );

    const [txnRows] = await pool.query(
      `
      SELECT id, order_id, amount, payment_method, status, reference_number, created_at
      FROM transactions
      WHERE order_id = ? AND transaction_type = 'purchase'
      LIMIT 1
      `,
      [orderId]
    );

    const [pdRows] = await pool.query(
      `
      SELECT
        cardholder_name, card_last4, card_expiry,
        ewallet_number, ewallet_reference, amount_tendered, change_due
      FROM payment_details
      WHERE order_id = ?
      LIMIT 1
      `,
      [orderId]
    );

    const order = mapOrderRow(orderRows[0]);
    const items = itemRows.map(mapItemRow);
    const txn = txnRows[0] ? mapTransactionRow(txnRows[0]) : null;
    const paymentDetail = pdRows[0] ? mapPaymentDetailRow(pdRows[0]) : null;

    return NextResponse.json({
      order: {
        ...order,
        referenceNumber: txn?.referenceNumber || null,
        items,
        transaction: txn,
        paymentDetail,
      },
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 }
    );
  }
}

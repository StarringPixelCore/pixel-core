import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  mapItemRow,
  mapOrderRow,
  mapPaymentDetailRow,
  mapTransactionRow,
} from "@/lib/ordersMappers";

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const ALLOWED_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

function isValidOrderStatus(value) {
  return ALLOWED_ORDER_STATUSES.includes(value);
}

function isValidPaymentStatus(value) {
  return ALLOWED_PAYMENT_STATUSES.includes(value);
}

async function loadOrder(orderId) {
  const [orderRows] = await pool.query(
    `
      SELECT
        o.id,
        o.user_id,
        o.receive_method,
        o.delivery_address,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.subtotal,
        o.shipping_fee,
        o.total_amount,
        o.notes,
        o.created_at,
        o.updated_at,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.id = ?
      LIMIT 1
    `,
    [orderId]
  );

  if (orderRows.length === 0) return null;

  const [itemRows] = await pool.query(
    `
      SELECT
        id, order_id, product_id, product_name, product_image, quantity, unit_price, subtotal
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `,
    [orderId]
  );

  const [txnRows] = await pool.query(
    `
      SELECT
        id,
        order_id,
        amount,
        payment_method,
        status,
        reference_number,
        created_at
      FROM transactions
      WHERE order_id = ? AND transaction_type = 'purchase'
      LIMIT 1
    `,
    [orderId]
  );

  const [pdRows] = await pool.query(
    `
      SELECT
        cardholder_name,
        card_last4,
        card_expiry,
        ewallet_number,
        ewallet_reference,
        amount_tendered,
        change_due
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

  return {
    ...order,
    buyer: {
      firstName: orderRows[0].first_name,
      lastName: orderRows[0].last_name,
      email: orderRows[0].email,
    },
    items,
    transaction: txn,
    paymentDetail,
  };
}

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

    if (users[0].role !== "Seller") {
      return NextResponse.json(
        { error: "Only sellers can manage orders" },
        { status: 403 }
      );
    }

    const params = await context.params;
    const orderId = Number(params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await loadOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("LOAD SELLER ORDER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
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

    if (users[0].role !== "Seller") {
      return NextResponse.json(
        { error: "Only sellers can manage orders" },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const params = await context.params;
    const orderId = Number(params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const { orderStatus, paymentStatus } = body || {};
    if (!isValidOrderStatus(orderStatus)) {
      return NextResponse.json(
        { error: "Invalid orderStatus" },
        { status: 400 }
      );
    }

    if (!isValidPaymentStatus(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid paymentStatus" },
        { status: 400 }
      );
    }

    await pool.query(
      `
        UPDATE orders
        SET order_status = ?, payment_status = ?, updated_at = NOW()
        WHERE id = ?
      `,
      [orderStatus, paymentStatus, orderId]
    );

    // Keep transaction status consistent with payment status when possible.
    await pool.query(
      `
        UPDATE transactions
        SET status = ?
        WHERE order_id = ? AND transaction_type = 'purchase'
      `,
      [paymentStatus, orderId]
    );

    const updatedOrder = await loadOrder(orderId);
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("UPDATE SELLER ORDER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}


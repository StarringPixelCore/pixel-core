import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

function validateCheckout(body) {
  const errors = {};
  const receiveMethod = body.receiveMethod;
  const deliveryAddress = body.deliveryAddress;
  const paymentMethod = body.paymentMethod;
  const notes = body.notes;

  if (!["pickup", "delivery"].includes(receiveMethod)) {
    errors.receiveMethod = "Choose pickup or delivery";
  }
  if (receiveMethod === "delivery") {
    if (!deliveryAddress || String(deliveryAddress).trim().length < 5) {
      errors.deliveryAddress = "Please enter a full delivery address";
    }
  }

  if (
    !["cash", "credit_debit_card", "gcash", "maya"].includes(paymentMethod)
  ) {
    errors.paymentMethod = "Select a payment method";
  }

  if (paymentMethod === "credit_debit_card") {
    const c = body.card || {};
    if (!c.cardholderName?.trim()) {
      errors.cardholderName = "Cardholder name is required";
    }
    if (!/^\d{4}$/.test(String(c.last4 || "").trim())) {
      errors.cardLast4 = "Enter the last 4 digits on your card";
    }
    if (!/^\d{2}\/\d{4}$/.test(String(c.expiry || "").trim())) {
      errors.cardExpiry = "Use MM/YYYY (e.g. 09/2027)";
    }
  }

  if (paymentMethod === "gcash" || paymentMethod === "maya") {
    const e = body.ewallet || {};
    const num = String(e.number || "").replace(/\D/g, "");
    if (num.length < 10 || num.length > 15) {
      errors.ewalletNumber = "Enter a valid mobile number";
    }
  }

  if (paymentMethod === "cash") {
    const cash = body.cash || {};
    if (cash.amountTendered != null && cash.amountTendered !== "") {
      const tendered = Number(cash.amountTendered);
      if (Number.isNaN(tendered) || tendered < 0) {
        errors.amountTendered = "Enter a valid amount";
      }
    }
  }

  if (notes != null && String(notes).length > 2000) {
    errors.notes = "Notes must be 2000 characters or less";
  }

  return errors;
}

export async function POST(req) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { error: "Please log in to place an order" },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validationErrors = validateCheckout(body);
  if (Object.keys(validationErrors).length > 0) {
    return NextResponse.json({ errors: validationErrors }, { status: 400 });
  }

  const userId = session.userId;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.query(
      "SELECT id FROM cart WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (cartRows.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const cartId = cartRows[0].id;

    const [items] = await conn.query(
      `
      SELECT ci.id, ci.product_id, ci.quantity, ci.price,
             p.name, p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      `,
      [cartId]
    );

    if (items.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum, row) => sum + Number(row.price) * Number(row.quantity),
      0
    );

    const receiveMethod = body.receiveMethod;
    const shippingFee = receiveMethod === "delivery" ? 50 : 0;
    const totalAmount = subtotal + shippingFee;

    const deliveryAddress =
      receiveMethod === "delivery"
        ? String(body.deliveryAddress).trim()
        : null;

    const paymentMethod = body.paymentMethod;

    if (paymentMethod === "cash") {
      const cash = body.cash || {};
      if (cash.amountTendered != null && cash.amountTendered !== "") {
        const tendered = Number(cash.amountTendered);
        if (!Number.isNaN(tendered) && tendered < totalAmount) {
          await conn.rollback();
          return NextResponse.json(
            {
              errors: {
                amountTendered: "Amount must be at least the order total",
              },
            },
            { status: 400 }
          );
        }
      }
    }

    const [orderResult] = await conn.query(
      `
      INSERT INTO orders (
        user_id, receive_method, delivery_address, payment_method,
        payment_status, order_status, subtotal, shipping_fee, total_amount, notes
      ) VALUES (?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?)
      `,
      [
        userId,
        receiveMethod,
        deliveryAddress,
        paymentMethod,
        subtotal,
        shippingFee,
        totalAmount,
        body.notes ? String(body.notes).trim().slice(0, 2000) : null,
      ]
    );

    const orderId = orderResult.insertId;

    for (const row of items) {
      const lineSub = Number(row.price) * Number(row.quantity);
      await conn.query(
        `
        INSERT INTO order_items (
          order_id, product_id, product_name, product_image, quantity, unit_price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          row.product_id,
          row.name,
          row.image_url || null,
          row.quantity,
          row.price,
          lineSub,
        ]
      );
    }

    const pd = {
      cardholder_name: null,
      card_last4: null,
      card_expiry: null,
      ewallet_number: null,
      ewallet_reference: null,
      amount_tendered: null,
      change_due: null,
    };

    if (paymentMethod === "credit_debit_card") {
      const c = body.card || {};
      pd.cardholder_name = c.cardholderName.trim();
      pd.card_last4 = c.last4.trim();
      pd.card_expiry = c.expiry.trim();
    } else if (paymentMethod === "gcash" || paymentMethod === "maya") {
      const e = body.ewallet || {};
      pd.ewallet_number = String(e.number).replace(/\D/g, "");
      pd.ewallet_reference = e.reference?.trim() || null;
    } else if (paymentMethod === "cash") {
      const cash = body.cash || {};
      if (cash.amountTendered != null && cash.amountTendered !== "") {
        const tendered = Number(cash.amountTendered);
        if (!Number.isNaN(tendered) && tendered >= totalAmount) {
          pd.amount_tendered = tendered;
          pd.change_due = tendered - totalAmount;
        }
      }
    }

    await conn.query(
      `
      INSERT INTO payment_details (
        order_id, cardholder_name, card_last4, card_expiry,
        ewallet_number, ewallet_reference, amount_tendered, change_due
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        pd.cardholder_name,
        pd.card_last4,
        pd.card_expiry,
        pd.ewallet_number,
        pd.ewallet_reference,
        pd.amount_tendered,
        pd.change_due,
      ]
    );

    const referenceNumber = `PX-${orderId}-${Date.now().toString(36).toUpperCase()}`;

    await conn.query(
      `
      INSERT INTO transactions (
        order_id, user_id, transaction_type, amount, payment_method, status, reference_number
      ) VALUES (?, ?, 'purchase', ?, ?, 'pending', ?)
      `,
      [orderId, userId, totalAmount, paymentMethod, referenceNumber]
    );

    await conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    await conn.commit();

    return NextResponse.json({
      message: "Order placed successfully",
      orderId,
      referenceNumber,
    });
  } catch (error) {
    await conn.rollback();
    console.error("CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

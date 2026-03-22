export function mapOrderRow(row) {
  return {
    id: row.id,
    receiveMethod: row.receive_method,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    totalAmount: row.total_amount,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapItemRow(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    subtotal: row.subtotal,
  };
}

export function mapPaymentDetailRow(row) {
  if (!row) return null;
  return {
    cardholderName: row.cardholder_name,
    cardLast4: row.card_last4,
    cardExpiry: row.card_expiry,
    ewalletNumber: row.ewallet_number,
    ewalletReference: row.ewallet_reference,
    amountTendered: row.amount_tendered,
    changeDue: row.change_due,
  };
}

export function mapTransactionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    amount: row.amount,
    paymentMethod: row.payment_method,
    status: row.status,
    referenceNumber: row.reference_number,
    createdAt: row.created_at,
  };
}

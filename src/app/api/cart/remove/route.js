import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(req) {
  try {
    const { itemId } = await req.json();

    await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);

    return NextResponse.json({ message: "Item removed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
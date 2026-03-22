import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  try {
    // Add badge column if it doesn't exist
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN badge VARCHAR(255) DEFAULT '' IF NOT EXISTS
    `);

    return NextResponse.json({
      message: "✅ Badge column added successfully!"
    });
  } catch (error) {
    // If column already exists, that's fine
    if (error.message.includes("Duplicate column")) {
      return NextResponse.json({
        message: "✅ Badge column already exists!"
      });
    }
    
    console.error(error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

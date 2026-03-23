import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  try {
    const products = [
      {
        name: 'Coir Seedling Pot',
        description: 'Biodegradable seedling pot made from compressed coconut coir fiber.',
        price: 45.00,
        badge: 'Best Seller',
        category: 'Gardening',
        image_url: '/images/seedling-pot.jpg'
      },
      {
        name: 'Coir Welcome Doormat',
        description: 'Durable natural coir doormat that keeps dirt and moisture at bay.',
        price: 350.00,
        badge: 'Trending',
        category: 'Home & Decor',
        image_url: '/images/doormat.png'
      },
      {
        name: 'Coconut Coir Rope (10m)',
        description: 'Strong, eco-friendly twisted rope ideal for crafts and construction.',
        price: 120.00,
        badge: '',
        category: 'Construction',
        image_url: '/images/rope.jpg'
      },
      {
        name: 'Coir Growing Medium (5kg)',
        description: 'Premium coconut coir substrate for hydroponic and soil gardening.',
        price: 180.00,
        badge: 'New',
        category: 'Gardening',
        image_url: '/images/growbags.png'
      },
      {
        name: 'Natural Coir Scrub Brush',
        description: 'Eco-friendly scrub brush made from natural coconut coir bristles.',
        price: 85.00,
        badge: '',
        category: 'Cleaning',
        image_url: '/images/brush.jpg'
      },
      {
        name: 'Erosion Control Coir Mat',
        description: 'Biodegradable coir mat designed to prevent soil erosion on slopes and embankments.',
        price: 480.00,
        badge: '',
        category: 'Construction',
        image_url: '/images/coir-mat.jpg'
      },
      {
        name: 'Hanging Basket Liner',
        description: 'Natural coir liner for hanging baskets, providing excellent drainage and aeration for plants.',
        price: 180.00,
        badge: 'Popular',
        category: 'Gardening',
        image_url: '/images/hanging-pot.jpg'
      }
    ];

    let insertedCount = 0;
    for (const product of products) {
      await pool.query(
        'INSERT INTO products (name, description, price, badge, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.badge, product.category, product.image_url]
      );
      insertedCount++;
    }

    return NextResponse.json({
      message: `✅ Successfully restored ${insertedCount} products with badges!`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: `❌ Error: ${error.message}` },
      { status: 500 }
    );
  }
}

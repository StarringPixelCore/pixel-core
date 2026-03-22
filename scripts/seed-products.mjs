import pool from '../src/lib/db.js';

async function insertTestProducts() {
  try {
    const products = [
      { name: 'Coconut Coir Potting Mix', description: 'Premium quality coconut coir for potting plants', price: 499.99, category: 'Gardening', image_url: '/images/coir-potting-mix.jpg' },
      { name: 'Coir Grow Blocks', description: 'Compressed coir blocks for hydroponic systems', price: 1299.99, category: 'Gardening', image_url: '/images/coir-blocks.jpg' },
      { name: 'Decorative Coir Mats', description: 'Natural coir door mats for home decor', price: 899.99, category: 'Home & Decor', image_url: '/images/coir-mat.jpg' },
      { name: 'Coir Erosion Control Fiber', description: 'Erosion prevention coir for construction projects', price: 2499.99, category: 'Construction', image_url: '/images/coir-fiber.jpg' },
      { name: 'Coir Cleaning Brush', description: 'Durable coir brush for heavy-duty cleaning', price: 349.99, category: 'Cleaning', image_url: '/images/coir-brush.jpg' },
      { name: 'Coir Planter Liners', description: 'Natural coir liners for planters', price: 599.99, category: 'Gardening', image_url: '/images/coir-liner.jpg' },
      { name: 'Coir Rope', description: 'Twisted coir rope for various applications', price: 449.99, category: 'Construction', image_url: '/images/coir-rope.jpg' },
      { name: 'Coir Board Sheets', description: 'Lightweight coir boards for insulation', price: 3499.99, category: 'Construction', image_url: '/images/coir-board.jpg' },
      { name: 'Coir Floor Mats', description: 'Heavy-duty coir floor mats for outdoor areas', price: 1899.99, category: 'Home & Decor', image_url: '/images/coir-floor-mat.jpg' },
      { name: 'Organic Coir Substrate', description: 'Premium substrate for plant cultivation', price: 699.99, category: 'Gardening', image_url: '/images/coir-substrate.jpg' },
    ];

    for (const product of products) {
      await pool.query(
        'INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.category, product.image_url]
      );
    }

    console.log(`✅ Successfully inserted ${products.length} test products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting products:', error);
    process.exit(1);
  }
}

insertTestProducts();

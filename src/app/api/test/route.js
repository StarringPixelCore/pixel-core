import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT 1');
    return Response.json({ message: 'Database connected successfully!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
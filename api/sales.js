import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Create products table
    await sql`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      packageName TEXT,
      retailPrice NUMERIC(12,2) NOT NULL,
      distributorPrice NUMERIC(12,2) NOT NULL,
      provisional BOOLEAN DEFAULT false,
      createdAt TIMESTAMPTZ DEFAULT NOW()
    );`;

    // Create inventory table
    await sql`CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      productId INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantityOnHand INT DEFAULT 0,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(productId)
    );`;

    // Create sales table
    await sql`CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      customerName TEXT NOT NULL,
      productId INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      amountPaid NUMERIC(12,2) NOT NULL,
      purchaseDate DATE NOT NULL,
      deliveryStage TEXT NOT NULL DEFAULT 'awaiting_pickup',
      createdAt TIMESTAMPTZ DEFAULT NOW()
    );`;

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT s.*, p.name AS productName 
        FROM sales s 
        LEFT JOIN products p ON p.id = s.productId 
        ORDER BY s.createdAt DESC;
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { customerName, productId, amountPaid, purchaseDate, deliveryStage } = req.body || {};
      
      if (!customerName || !productId || amountPaid === undefined || !purchaseDate) {
        return res.status(400).json({ error: 'Missing required sale fields' });
      }

      const result = await sql`
        INSERT INTO sales (customerName, productId, amountPaid, purchaseDate, deliveryStage)
        VALUES (${customerName}, ${Number(productId)}, ${Number(amountPaid)}, ${purchaseDate}, ${deliveryStage || 'awaiting_pickup'})
        RETURNING *;
      `;
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      packageName TEXT,
      retailPrice NUMERIC(12,2) NOT NULL,
      distributorPrice NUMERIC(12,2) NOT NULL,
      provisional BOOLEAN DEFAULT false,
      createdAt TIMESTAMPTZ DEFAULT NOW()
    );`;

    await sql`CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      productId INT UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantityOnHand INT NOT NULL DEFAULT 0
    );`;

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT i.*, p.name
        FROM inventory i
        LEFT JOIN products p ON p.id = i.productId
        ORDER BY p.name ASC;
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'PUT') {
      const { productId, quantityOnHand } = req.body || {};
      if (productId === undefined || quantityOnHand === undefined) {
        return res.status(400).json({ error: 'Missing fields: productId and quantityOnHand' });
      }

      const result = await sql`
        UPDATE inventory
        SET quantityOnHand = ${Number(quantityOnHand)}
        WHERE productId = ${Number(productId)}
        RETURNING *;
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

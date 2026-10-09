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
      const { rows } = await sql`SELECT * FROM products ORDER BY createdAt DESC;`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, packageName, retailPrice, distributorPrice, provisional } = req.body || {};
      if (!name || retailPrice === undefined || distributorPrice === undefined) {
        return res.status(400).json({ error: 'Missing required fields: name, retailPrice, distributorPrice' });
      }

      const result = await sql`
        INSERT INTO products (name, packageName, retailPrice, distributorPrice, provisional)
        VALUES (${name}, ${packageName || null}, ${Number(retailPrice)}, ${Number(distributorPrice)}, ${Boolean(provisional)})
        RETURNING *;
      `;

      await sql`
        INSERT INTO inventory (productId, quantityOnHand)
        VALUES (${result.rows[0].id}, 0);
      `;

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

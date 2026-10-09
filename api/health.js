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

    await sql`CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      customerName TEXT NOT NULL,
      productId INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      amountPaid NUMERIC(12,2) NOT NULL,
      purchaseDate DATE NOT NULL,
      deliveryStage TEXT NOT NULL DEFAULT 'awaiting_pickup',
      createdAt TIMESTAMPTZ DEFAULT NOW()
    );`;

    const { rows } = await sql`SELECT COUNT(*)::int AS count FROM products;`;
    if (Number(rows[0].count) === 0) {
      const seed = [
        ['Pain Vile Oil', null, 250, 180],
        ['Soft Lax', null, 350, 280],
        ['Chodex 3', null, 350, 280],
        ['Garlic', null, 350, 280],
        ['Utritone', '60 caps', 350, 280],
        ['B Comfort Capsules', '60 caps', 350, 280],
        ['Beher 3', '60 caps', 350, 280],
        ['B Comfort Oil', null, 250, 180]
      ];

      for (const [name, packageName, retailPrice, distributorPrice] of seed) {
        const result = await sql`
          INSERT INTO products (name, packageName, retailPrice, distributorPrice)
          VALUES (${name}, ${packageName}, ${retailPrice}, ${distributorPrice})
          RETURNING id;
        `;

        await sql`
          INSERT INTO inventory (productId, quantityOnHand)
          VALUES (${result.rows[0].id}, 0);
        `;
      }
    }

    return res.status(200).json({ ok: true, message: 'Database ready' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { rows } = await sql`SELECT NOW() as now;`;
    return res.status(200).json({ ok: true, time: rows[0].now });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

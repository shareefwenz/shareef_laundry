const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const q = req.query.search ? `%${req.query.search}%` : '%';
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY customer_id DESC', [q, q]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  try {
    const [r] = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?,?,?,?)',
      [name, phone, email || null, address || null]);
    res.status(201).json({ customer_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  try {
    await pool.query(
      'UPDATE customers SET name=?, phone=?, email=?, address=? WHERE customer_id=?',
      [name, phone, email || null, address || null, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE customer_id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

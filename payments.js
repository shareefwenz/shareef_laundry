const router = require('express').Router();
const pool = require('../db');

const PAY_STATUSES = ['Paid', 'Pending', 'Partial'];

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.payment_id, p.order_id, c.name AS customer_name, p.amount,
             p.payment_date, p.payment_method, p.status
      FROM payments p
      JOIN orders o ON o.order_id = p.order_id
      JOIN customers c ON c.customer_id = o.customer_id
      ORDER BY p.payment_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { order_id, amount, payment_date, payment_method, status } = req.body;
  if (!order_id || !(Number(amount) > 0))
    return res.status(400).json({ error: 'Order and a valid amount are required' });
  if (status && !PAY_STATUSES.includes(status))
    return res.status(400).json({ error: 'Invalid payment status' });
  try {
    const [r] = await pool.query(
      'INSERT INTO payments (order_id, amount, payment_date, payment_method, status) VALUES (?,?,COALESCE(?, CURDATE()),?,?)',
      [order_id, amount, payment_date || null, payment_method || 'Cash', status || 'Paid']);
    res.status(201).json({ payment_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!PAY_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid payment status' });
  try {
    await pool.query('UPDATE payments SET status=? WHERE payment_id=?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM payments WHERE payment_id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

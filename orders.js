const router = require('express').Router();
const pool = require('../db');

const STATUSES = ['Received', 'Washing', 'Ironing', 'Dry Cleaning', 'Ready', 'Delivered'];

// List orders with customer, service and amount paid
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.order_id, o.customer_id, c.name AS customer_name, c.phone,
             o.service_id, s.service_name, o.clothes_weight,
             o.order_date, o.delivery_date, o.total_amount, o.status,
             COALESCE((SELECT SUM(p.amount) FROM payments p
                       WHERE p.order_id = o.order_id AND p.status = 'Paid'), 0) AS paid_amount
      FROM orders o
      JOIN customers c ON c.customer_id = o.customer_id
      JOIN services  s ON s.service_id  = o.service_id
      ORDER BY o.order_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create order: total_amount = clothes_weight x service price_per_kg
router.post('/', async (req, res) => {
  const { customer_id, service_id, clothes_weight, delivery_date } = req.body;
  const weight = Number(clothes_weight);
  if (!customer_id || !service_id || !(weight > 0))
    return res.status(400).json({ error: 'Customer, service and a valid weight are required' });
  try {
    const [[svc]] = await pool.query('SELECT price_per_kg FROM services WHERE service_id=?', [service_id]);
    if (!svc) return res.status(400).json({ error: 'Invalid service selected' });
    const total = Math.round(weight * Number(svc.price_per_kg) * 100) / 100;
    const [r] = await pool.query(
      `INSERT INTO orders (customer_id, service_id, clothes_weight, order_date, delivery_date, total_amount, status)
       VALUES (?,?,?,CURDATE(),?,?,?)`,
      [customer_id, service_id, weight, delivery_date || null, total, 'Received']);
    res.status(201).json({ order_id: r.insertId, total_amount: total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Staff updates order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await pool.query('UPDATE orders SET status=? WHERE order_id=?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE order_id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

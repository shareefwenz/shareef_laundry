const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY service_id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { service_name, price_per_kg, description } = req.body;
  if (!service_name || price_per_kg === undefined || price_per_kg === '')
    return res.status(400).json({ error: 'Service name and price per kg are required' });
  try {
    const [r] = await pool.query(
      'INSERT INTO services (service_name, price_per_kg, description) VALUES (?,?,?)',
      [service_name, price_per_kg, description || null]);
    res.status(201).json({ service_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { service_name, price_per_kg, description } = req.body;
  try {
    await pool.query(
      'UPDATE services SET service_name=?, price_per_kg=?, description=? WHERE service_id=?',
      [service_name, price_per_kg, description || null, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE service_id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Cannot delete a service that is used in orders' });
  }
});

module.exports = router;

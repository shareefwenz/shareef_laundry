require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/customers', require('./routes/customers'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));

// Dashboard numbers
app.get('/api/stats', async (req, res) => {
  try {
    const [[c]] = await pool.query('SELECT COUNT(*) AS n FROM customers');
    const [[o]] = await pool.query('SELECT COUNT(*) AS n FROM orders');
    const [[p]] = await pool.query("SELECT COUNT(*) AS n FROM orders WHERE status <> 'Delivered'");
    const [[r]] = await pool.query('SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = \'Paid\'');
    res.json({ customers: c.n, orders: o.n, pending: p.n, revenue: r.total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shareef Laundry Service Management System running at http://localhost:${PORT}`));

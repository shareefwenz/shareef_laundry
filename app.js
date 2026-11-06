const ORDER_STATUSES = ['Received', 'Washing', 'Ironing', 'Dry Cleaning', 'Ready', 'Delivered'];
const PAY_STATUSES = ['Paid', 'Pending', 'Partial'];
const $ = (id) => document.getElementById(id);
let services = [];

async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { alert(data.error || 'Something went wrong'); throw new Error(data.error); }
  return data;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => Number(n || 0).toFixed(2);

// ---------- Tabs ----------
document.querySelectorAll('nav button').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('nav button, .tab').forEach((e) => e.classList.remove('active'));
    b.classList.add('active');
    $(b.dataset.tab).classList.add('active');
    loadAll();
  }));

// ---------- Dashboard ----------
async function loadStats() {
  const s = await api('/api/stats');
  $('st-customers').textContent = s.customers;
  $('st-orders').textContent = s.orders;
  $('st-pending').textContent = s.pending;
  $('st-revenue').textContent = money(s.revenue);
}

// ---------- Customers ----------
async function loadCustomers() {
  const list = await api('/api/customers?search=' + encodeURIComponent($('c-search').value));
  $('customers-body').innerHTML = list.map((c) => `
    <tr><td>${c.customer_id}</td><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${esc(c.email)}</td><td>${esc(c.address)}</td>
    <td><button class="small" data-edit='${esc(JSON.stringify(c))}'>Edit</button>
        <button class="small danger" onclick="delCustomer(${c.customer_id})">Delete</button></td></tr>`).join('');
  document.querySelectorAll('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => editCustomer(JSON.parse(b.dataset.edit))));
  const all = await api('/api/customers');
  const current = $('o-customer').value;
  $('o-customer').innerHTML = '<option value="">Select customer</option>' +
    all.map((c) => `<option value="${c.customer_id}">${esc(c.name)} (${esc(c.phone)})</option>`).join('');
  $('o-customer').value = current;
}
function editCustomer(c) {
  $('c-id').value = c.customer_id; $('c-name').value = c.name; $('c-phone').value = c.phone;
  $('c-email').value = c.email || ''; $('c-address').value = c.address || '';
  window.scrollTo(0, 0);
}
window.delCustomer = async (id) => {
  if (!confirm('Delete this customer and all their orders?')) return;
  await api('/api/customers/' + id, 'DELETE'); loadAll();
};
$('customer-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { name: $('c-name').value, phone: $('c-phone').value, email: $('c-email').value, address: $('c-address').value };
  const id = $('c-id').value;
  await api(id ? '/api/customers/' + id : '/api/customers', id ? 'PUT' : 'POST', body);
  clearCustomerForm(); loadAll();
});
function clearCustomerForm() { $('customer-form').reset(); $('c-id').value = ''; }
$('c-cancel').addEventListener('click', clearCustomerForm);
$('c-search').addEventListener('input', loadCustomers);

// ---------- Services ----------
async function loadServices() {
  services = await api('/api/services');
  $('services-body').innerHTML = services.map((s) => `
    <tr><td>${s.service_id}</td><td>${esc(s.service_name)}</td><td>${money(s.price_per_kg)}</td><td>${esc(s.description)}</td>
    <td><button class="small danger" onclick="delService(${s.service_id})">Delete</button></td></tr>`).join('');
  const current = $('o-service').value;
  $('o-service').innerHTML = '<option value="">Select service</option>' +
    services.map((s) => `<option value="${s.service_id}">${esc(s.service_name)} - ₹${money(s.price_per_kg)}/kg</option>`).join('');
  $('o-service').value = current;
  updateTotal();
}
window.delService = async (id) => {
  if (!confirm('Delete this service?')) return;
  await api('/api/services/' + id, 'DELETE'); loadServices();
};
$('service-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/api/services', 'POST', { service_name: $('s-name').value, price_per_kg: $('s-price').value, description: $('s-desc').value });
  e.target.reset(); loadServices();
});

// ---------- Orders ----------
function updateTotal() {
  const s = services.find((x) => String(x.service_id) === $('o-service').value);
  $('o-total').textContent = s ? money(Number($('o-weight').value || 0) * Number(s.price_per_kg)) : '0.00';
}
$('o-service').addEventListener('change', updateTotal);
$('o-weight').addEventListener('input', updateTotal);

$('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await api('/api/orders', 'POST', {
    customer_id: $('o-customer').value,
    service_id: $('o-service').value,
    clothes_weight: $('o-weight').value,
    delivery_date: $('o-delivery').value
  });
  alert('Order #' + r.order_id + ' placed. Total: ₹' + money(r.total_amount));
  e.target.reset(); updateTotal(); loadAll();
});

async function loadOrders() {
  const list = await api('/api/orders');
  $('orders-body').innerHTML = list.map((o) => `
    <tr><td>${o.order_id}</td><td>${esc(o.customer_name)}</td><td>${esc(o.service_name)}</td><td>${money(o.clothes_weight)}</td>
    <td>${esc(o.order_date || '-')}</td><td>${esc(o.delivery_date || '-')}</td>
    <td>${money(o.total_amount)}</td><td>${money(o.paid_amount)}</td>
    <td><select onchange="setOrderStatus(${o.order_id}, this.value)">
      ${ORDER_STATUSES.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td><button class="small danger" onclick="delOrder(${o.order_id})">Delete</button></td></tr>`).join('');
  $('p-order').innerHTML = '<option value="">Select order</option>' + list.map((o) =>
    `<option value="${o.order_id}">#${o.order_id} - ${esc(o.customer_name)} (balance ₹${money(o.total_amount - o.paid_amount)})</option>`).join('');
}
window.setOrderStatus = async (id, status) => { await api(`/api/orders/${id}/status`, 'PUT', { status }); loadStats(); };
window.delOrder = async (id) => {
  if (!confirm('Delete this order?')) return;
  await api('/api/orders/' + id, 'DELETE'); loadAll();
};

// ---------- Payments ----------
async function loadPayments() {
  const list = await api('/api/payments');
  $('payments-body').innerHTML = list.map((p) => `
    <tr><td>${p.payment_id}</td><td>#${p.order_id}</td><td>${esc(p.customer_name)}</td><td>${money(p.amount)}</td>
    <td>${esc(p.payment_date || '-')}</td><td>${esc(p.payment_method)}</td>
    <td><select onchange="setPayStatus(${p.payment_id}, this.value)">
      ${PAY_STATUSES.map((s) => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td><button class="small danger" onclick="delPayment(${p.payment_id})">Delete</button></td></tr>`).join('');
}
window.setPayStatus = async (id, status) => { await api(`/api/payments/${id}/status`, 'PUT', { status }); loadAll(); };
window.delPayment = async (id) => {
  if (!confirm('Delete this payment record?')) return;
  await api('/api/payments/' + id, 'DELETE'); loadAll();
};
$('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/api/payments', 'POST', {
    order_id: $('p-order').value, amount: $('p-amount').value, payment_date: $('p-date').value,
    payment_method: $('p-method').value, status: $('p-status').value
  });
  e.target.reset(); loadAll();
});

// ---------- Init ----------
async function loadAll() {
  await Promise.all([loadServices(), loadStats(), loadCustomers()]);
  await Promise.all([loadOrders(), loadPayments()]);
}
loadAll();

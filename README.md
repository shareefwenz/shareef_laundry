# Shareef Laundry Service Management System

Manage laundry orders and customer services. Customers submit clothes for **washing, ironing and dry cleaning**; staff update order status and maintain payment records.

**Tech stack:** HTML, CSS, JavaScript (frontend) · Express.js (backend) · MySQL (database)

## Database: `shareef_laundry_db`

| Table | Fields |
|---|---|
| **customers** | `customer_id` INT PK, `name` VARCHAR(100), `phone` VARCHAR(15), `email` VARCHAR(100), `address` VARCHAR(255) |
| **services** | `service_id` INT PK, `service_name` VARCHAR(100), `price_per_kg` DECIMAL(10,2), `description` VARCHAR(255) |
| **orders** | `order_id` INT PK, `customer_id` INT FK, `service_id` INT FK, `clothes_weight` DECIMAL(8,2), `order_date` DATE, `delivery_date` DATE, `total_amount` DECIMAL(10,2), `status` VARCHAR(30) |
| **payments** | `payment_id` INT PK, `order_id` INT FK, `amount` DECIMAL(10,2), `payment_date` DATE, `payment_method` VARCHAR(30), `status` VARCHAR(20) |

Order status values: Received, Washing, Ironing, Dry Cleaning, Ready, Delivered.
Payment status values: Paid, Pending, Partial.

## Features
- Add, edit, delete and search customers
- Manage laundry services and price per kg
- Create orders (total = clothes weight × price per kg, calculated automatically)
- Staff can update order status
- Record payments (Cash / UPI / Card) and track payment status
- Dashboard with customer, order and revenue counts

## Setup

1. Install [Node.js](https://nodejs.org) and MySQL.
2. Create the database and tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and put in your MySQL password:
   ```bash
   cp .env.example .env
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open http://localhost:3000

## Upload to GitHub

```bash
git init
git add .
git commit -m "Shareef Laundry Service Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/shareef-laundry-management.git
git push -u origin main
```

## Project structure

```
server.js          Express app entry
db.js              MySQL connection pool
routes/            customers, services, orders, payments APIs
database/schema.sql
public/            index.html, css/style.css, js/app.js
```

Author: Shareef

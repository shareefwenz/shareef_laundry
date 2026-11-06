-- Shareef Laundry Service Management System - MySQL schema
CREATE DATABASE IF NOT EXISTS shareef_laundry_db;
USE shareef_laundry_db;

-- Table 1: customers
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(15)  NOT NULL,
  email       VARCHAR(100),
  address     VARCHAR(255)
);

-- Table 2: services
CREATE TABLE IF NOT EXISTS services (
  service_id    INT AUTO_INCREMENT PRIMARY KEY,
  service_name  VARCHAR(100)  NOT NULL,
  price_per_kg  DECIMAL(10,2) NOT NULL,
  description   VARCHAR(255)
);

-- Table 3: orders
CREATE TABLE IF NOT EXISTS orders (
  order_id       INT AUTO_INCREMENT PRIMARY KEY,
  customer_id    INT NOT NULL,
  service_id     INT NOT NULL,
  clothes_weight DECIMAL(8,2) NOT NULL,
  order_date     DATE,
  delivery_date  DATE,
  total_amount   DECIMAL(10,2),
  status         VARCHAR(30) DEFAULT 'Received',
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id)  REFERENCES services(service_id)
);

-- Table 4: payments
CREATE TABLE IF NOT EXISTS payments (
  payment_id     INT AUTO_INCREMENT PRIMARY KEY,
  order_id       INT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_date   DATE,
  payment_method VARCHAR(30),
  status         VARCHAR(20) DEFAULT 'Paid',
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO services (service_name, price_per_kg, description) VALUES
  ('Washing',      50.00,  'Wash and dry per kg'),
  ('Ironing',      30.00,  'Steam ironing per kg'),
  ('Dry Cleaning', 150.00, 'Professional dry cleaning per kg');

INSERT INTO customers (name, phone, email, address) VALUES
  ('Ravi Kumar', '9876543210', 'ravi@example.com', '12 Main Road, Kurnool');

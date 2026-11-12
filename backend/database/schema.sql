DROP DATABASE IF EXISTS Batloung_db;
CREATE DATABASE Batloung_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Batloung_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin','Sales') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(100) NOT NULL,
  province ENUM(
    'Eastern Cape','Free State','Gauteng','KwaZulu-Natal',
    'Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'
  ) NOT NULL,
  contact_person VARCHAR(100),
  telephone VARCHAR(20),
  email VARCHAR(100),
  physical_address VARCHAR(255),
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supplier_province (province)
);

CREATE TABLE fruits (
  fruit_id INT AUTO_INCREMENT PRIMARY KEY,
  fruit_name VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('Active','Inactive') DEFAULT 'Active'
);

CREATE TABLE box_sizes (
  box_size_id INT AUTO_INCREMENT PRIMARY KEY,
  size_name ENUM('Small','Medium','Large') NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  fruit_id INT NOT NULL,
  box_size_id INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  available_stock INT NOT NULL DEFAULT 0,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  CONSTRAINT fk_products_fruit FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id),
  CONSTRAINT fk_products_box FOREIGN KEY (box_size_id) REFERENCES box_sizes(box_size_id),
  CONSTRAINT uq_product UNIQUE (fruit_id, box_size_id),
  CONSTRAINT chk_price CHECK (unit_price > 0),
  CONSTRAINT chk_stock CHECK (available_stock >= 0)
);

CREATE TABLE street_vendors (
  vendor_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(100) NOT NULL,
  business_name VARCHAR(100),
  telephone VARCHAR(20),
  location_maseru VARCHAR(100),
  registration_date DATE,
  status ENUM('Active','Inactive') DEFAULT 'Active'
);

CREATE TABLE purchases (
  purchase_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  CONSTRAINT fk_purchases_product FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT chk_purchase_qty CHECK (quantity > 0),
  CONSTRAINT chk_purchase_cost CHECK (cost_price > 0)
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  order_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM(
    'Pending','Confirmed','Processing',
    'Ready for Collection/Delivery','Completed','Cancelled'
  ) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_vendor FOREIGN KEY (vendor_id) REFERENCES street_vendors(vendor_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_date (order_date)
);

CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_boxes INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT chk_item_qty CHECK (quantity_boxes > 0)
);
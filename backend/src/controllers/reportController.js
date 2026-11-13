// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');

// Returns the dashboard's counts, stock total, order counts, and completed sales value.
exports.dashboard = asyncHandler(async (req, res) => {
  const [[fruits]]     = await db.query('SELECT COUNT(*) AS total FROM fruits WHERE status="Active"');
  const [[suppliers]]  = await db.query('SELECT COUNT(*) AS total FROM suppliers WHERE status="Active"');
  const [[vendors]]    = await db.query('SELECT COUNT(*) AS total FROM street_vendors');
  const [[stock]]      = await db.query('SELECT COALESCE(SUM(available_stock),0) AS total FROM products');
  const [[orders]]     = await db.query('SELECT COUNT(*) AS total FROM orders');
  const [[pending]]    = await db.query("SELECT COUNT(*) AS total FROM orders WHERE status='Pending'");
  const [[completed]]  = await db.query("SELECT COUNT(*) AS total FROM orders WHERE status='Completed'");
  const [[sales]]      = await db.query("SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status='Completed'");

  res.json({
    totalFruits: Number(fruits.total),
    totalSuppliers: Number(suppliers.total),
    totalVendors: Number(vendors.total),
    availableStock: Number(stock.total),
    totalOrders: Number(orders.total),
    pendingOrders: Number(pending.total),
    completedOrders: Number(completed.total),
    salesValue: Number(sales.total)
  });
});

// Aggregates completed sales and box quantities by box size.
exports.salesByBoxSize = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.size_name AS label,
           COALESCE(SUM(oi.subtotal),0) AS value,
           COALESCE(SUM(oi.quantity_boxes),0) AS boxes
    FROM order_items oi
    JOIN orders o ON o.order_id = oi.order_id
    JOIN products p ON p.product_id = oi.product_id
    JOIN box_sizes b ON b.box_size_id = p.box_size_id
    WHERE o.status='Completed'
    GROUP BY b.size_name
    ORDER BY FIELD(b.size_name,'Small','Medium','Large')
  `);
  res.json(rows);
});

// Aggregates completed sales totals and order counts by vendor.
exports.salesByVendor = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT v.vendor_id, v.vendor_name AS label, v.business_name,
           COALESCE(SUM(o.total_amount),0) AS value,
           COUNT(o.order_id) AS orders
    FROM street_vendors v
    LEFT JOIN orders o ON o.vendor_id = v.vendor_id AND o.status='Completed'
    GROUP BY v.vendor_id
    ORDER BY value DESC
  `);
  res.json(rows);
});

// Aggregates purchased quantities and spending by supplier province.
exports.purchasesByProvince = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT s.province AS label,
           COALESCE(SUM(pu.quantity),0) AS value,
           COALESCE(SUM(pu.quantity * pu.cost_price),0) AS spend
    FROM purchases pu
    JOIN suppliers s ON s.supplier_id = pu.supplier_id
    GROUP BY s.province
    ORDER BY value DESC
  `);
  res.json(rows);
});

// Lists orders still moving through the non-completed workflow states.
exports.pendingOrders = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT o.order_id, o.order_date, o.total_amount, o.status,
           v.vendor_name, v.business_name
    FROM orders o
    JOIN street_vendors v ON v.vendor_id = o.vendor_id
    WHERE o.status IN ('Pending','Confirmed','Processing','Ready for Collection/Delivery')
    ORDER BY o.order_date DESC
  `);
  res.json(rows);
});

// Lists completed orders with their vendor details.
exports.completedOrders = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT o.order_id, o.order_date, o.total_amount, o.status,
           v.vendor_name, v.business_name
    FROM orders o
    JOIN street_vendors v ON v.vendor_id = o.vendor_id
    WHERE o.status='Completed'
    ORDER BY o.order_date DESC
  `);
  res.json(rows);
});

// Aggregates completed sales totals and order counts for each calendar date.
exports.totalSalesByDate = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT DATE(order_date) AS label,
           COALESCE(SUM(total_amount),0) AS value,
           COUNT(*) AS orders
    FROM orders
    WHERE status='Completed'
    GROUP BY DATE(order_date)
    ORDER BY label ASC
  `);
  res.json(rows);
});

// Ranks fruits by completed quantity sold and revenue generated.
exports.topSellingFruits = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT f.fruit_name AS label,
           SUM(oi.quantity_boxes) AS value,
           SUM(oi.subtotal) AS revenue
    FROM order_items oi
    JOIN orders o ON o.order_id = oi.order_id
    JOIN products p ON p.product_id = oi.product_id
    JOIN fruits f ON f.fruit_id = p.fruit_id
    WHERE o.status='Completed'
    GROUP BY f.fruit_id
    ORDER BY value DESC
  `);
  res.json(rows);
});

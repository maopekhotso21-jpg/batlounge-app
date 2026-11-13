const db = require('../config/db');

// Gets total boxes ordered for each fruit (used by the dashboard)
const getFruitQuantities = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT f.fruit_id, SUM(oi.quantity_boxes) as boxes_ordered
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN fruits f ON p.fruit_id = f.fruit_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY f.fruit_id
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Creates a new order
const createOrder = async (req, res, next) => {
  try {
    const { vendor_id, items } = req.body;
    // ... (Insert your existing createOrder logic here if you have it)
    res.status(201).json({ message: 'Order created' });
  } catch (error) {
    next(error);
  }
};

// Gets all orders
const getOrders = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY order_date DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Gets a single order by ID
const getOrderById = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// Updates an order
const updateOrder = async (req, res, next) => {
  try {
    await db.query('UPDATE orders SET ? WHERE order_id = ?', [req.body, req.params.id]);
    res.json({ message: 'Order updated' });
  } catch (error) {
    next(error);
  }
};

// Updates order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    next(error);
  }
};

// Deletes an order
const deleteOrder = async (req, res, next) => {
  try {
    await db.query('DELETE FROM orders WHERE order_id = ?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFruitQuantities,
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder
};
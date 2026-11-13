// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');
// Validates order states and quantities and creates HTTP-aware errors.
const { isValidOrderStatus, isPositiveNumber, assert } = require('../utils/validators');

// Lists orders with optional status, vendor, text, and date-range filters.
exports.getAll = asyncHandler(async (req, res) => {
  const { status, vendor_id, search = '', from, to } = req.query;
  let sql = `
    SELECT o.order_id, o.vendor_id, o.order_date, o.total_amount, o.status, o.created_at,
           v.vendor_name, v.business_name, v.telephone, v.location_maseru,
           (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count
    FROM orders o
    JOIN street_vendors v ON v.vendor_id = o.vendor_id
    WHERE 1=1
  `;
  const params = [];
  if (status) { sql += ' AND o.status=?'; params.push(status); }
  if (vendor_id) { sql += ' AND o.vendor_id=?'; params.push(vendor_id); }
  if (from) { sql += ' AND o.order_date >= ?'; params.push(from); }
  if (to) { sql += ' AND o.order_date <= ?'; params.push(to); }
  if (search) {
    sql += ' AND (v.vendor_name LIKE ? OR v.business_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY o.order_id DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// Summarizes ordered box quantities by fruit, excluding cancelled orders.
exports.fruitQuantities = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
        SELECT f.fruit_id, f.fruit_name,
          COALESCE(SUM(CASE WHEN o.order_id IS NOT NULL THEN oi.quantity_boxes ELSE 0 END), 0) AS boxes_ordered
    FROM fruits f
    LEFT JOIN products p ON p.fruit_id = f.fruit_id
    LEFT JOIN order_items oi ON oi.product_id = p.product_id
    LEFT JOIN orders o ON o.order_id = oi.order_id AND o.status <> 'Cancelled'
    WHERE f.status = 'Active'
    GROUP BY f.fruit_id, f.fruit_name
    ORDER BY f.fruit_name ASC
  `);
  res.json(rows);
});

// Retrieves one order, its vendor details, and all of its line items.
exports.getOne = asyncHandler(async (req, res) => {
  const [orders] = await db.query(`
    SELECT o.*, v.vendor_name, v.business_name, v.telephone, v.location_maseru
    FROM orders o
    JOIN street_vendors v ON v.vendor_id = o.vendor_id
    WHERE o.order_id=?
  `, [req.params.id]);
  assert(orders.length > 0, 'Order not found', 404);

  const [items] = await db.query(`
    SELECT oi.order_item_id, oi.product_id, oi.quantity_boxes, oi.unit_price, oi.subtotal,
           f.fruit_name, b.size_name
    FROM order_items oi
    JOIN products p ON p.product_id = oi.product_id
    JOIN fruits f ON f.fruit_id = p.fruit_id
    JOIN box_sizes b ON b.box_size_id = p.box_size_id
    WHERE oi.order_id=?
  `, [req.params.id]);

  res.json({ ...orders[0], items });
});

// Validates an order, checks stock, calculates totals, and inserts the order atomically.
// Product rows are locked while stock is checked so concurrent orders cannot oversell them.
exports.create = asyncHandler(async (req, res) => {
  const { vendor_id, order_date, items } = req.body;

  assert(Number(vendor_id) > 0, 'vendor_id is required');
  assert(order_date, 'order_date is required');
  assert(Array.isArray(items) && items.length > 0,
    'Order must contain at least one item');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Confirm that orders can only be placed for an active vendor.
    const [vendor] = await conn.query(
      'SELECT vendor_id, status FROM street_vendors WHERE vendor_id=?', [vendor_id]);
    assert(vendor.length > 0, 'Vendor not found', 404);
    assert(vendor[0].status === 'Active', 'Vendor is not active');

    let total = 0;
    const normalized = [];

    // Normalize each line and calculate its server-controlled price and subtotal.
    for (const it of items) {
      assert(Number(it.product_id) > 0, 'Each item must have a product_id');
      assert(isPositiveNumber(it.quantity_boxes),
        'Each item quantity_boxes must be > 0');

      // FOR UPDATE prevents another transaction from changing this stock during checkout.
      const [prod] = await conn.query(
        `SELECT product_id, unit_price, available_stock, status
         FROM products WHERE product_id=? FOR UPDATE`,
        [it.product_id]
      );
      assert(prod.length > 0, `Product ${it.product_id} not found`, 404);
      assert(prod[0].status === 'Active', `Product ${it.product_id} is inactive`);

      const unitPrice = Number(prod[0].unit_price);
      const qty = Number(it.quantity_boxes);

      assert(prod[0].available_stock >= qty,
        `Insufficient stock for product ${it.product_id} ` +
        `(available ${prod[0].available_stock}, requested ${qty})`);

      const subtotal = +(unitPrice * qty).toFixed(2);
      total += subtotal;
      normalized.push({ product_id: it.product_id, quantity_boxes: qty, unit_price: unitPrice, subtotal });
    }

    total = +total.toFixed(2);

    // Insert the order header first so its ID can be used by every line item.
    const [orderResult] = await conn.query(
      `INSERT INTO orders (vendor_id, order_date, total_amount, status)
       VALUES (?,?,?, 'Pending')`,
      [vendor_id, order_date, total]
    );
    const orderId = orderResult.insertId;

    // Insert the validated line items using prices read from the database.
    for (const n of normalized) {
      await conn.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity_boxes, unit_price, subtotal)
         VALUES (?,?,?,?,?)`,
        [orderId, n.product_id, n.quantity_boxes, n.unit_price, n.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({ order_id: orderId, total_amount: total, status: 'Pending' });
    // Undo the header and any items when any part of order creation fails.
  } catch (err) {
    await conn.rollback();
    throw err;
    // Always return the connection to the pool.
  } finally {
    conn.release();
  }
});

// Changes an order status and deducts stock when the order becomes completed.
// Completion is transactional so stock and status remain consistent.
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  assert(isValidOrderStatus(status), 'Invalid order status');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the order so two status changes cannot process it at the same time.
    const [rows] = await conn.query(
      'SELECT order_id, status FROM orders WHERE order_id=? FOR UPDATE',
      [req.params.id]
    );
    assert(rows.length > 0, 'Order not found', 404);

    const oldStatus = rows[0].status;
    assert(oldStatus !== 'Cancelled', 'Cancelled orders cannot be changed');
    assert(!(oldStatus === 'Completed' && status !== 'Completed'),
      'Completed orders cannot be reopened');

    if (status === 'Completed' && oldStatus !== 'Completed') {
      // Lock and deduct each product only when entering Completed status.
      const [items] = await conn.query(
        'SELECT product_id, quantity_boxes FROM order_items WHERE order_id=?',
        [req.params.id]
      );
      for (const it of items) {
        const [prod] = await conn.query(
          'SELECT available_stock FROM products WHERE product_id=? FOR UPDATE',
          [it.product_id]
        );
        assert(prod[0].available_stock >= it.quantity_boxes,
          `Insufficient stock to complete order for product ${it.product_id}`);
        await conn.query(
          'UPDATE products SET available_stock = available_stock - ? WHERE product_id=?',
          [it.quantity_boxes, it.product_id]
        );
      }
    }

    // Save the requested workflow status after any required stock deduction.
    await conn.query('UPDATE orders SET status=? WHERE order_id=?',
      [status, req.params.id]);

    await conn.commit();
    res.json({ message: 'Order status updated', status });
    // Undo stock deductions and status changes if completion fails.
  } catch (err) {
    await conn.rollback();
    throw err;
    // Always return the connection to the pool.
  } finally {
    conn.release();
  }
});

// Replaces the editable contents of a pending order and recalculates its total.
// Completed and cancelled orders are protected from edits.
exports.update = asyncHandler(async (req, res) => {
  const { vendor_id, order_date, items } = req.body;
  assert(Number(vendor_id) > 0, 'vendor_id is required');
  assert(order_date, 'order_date is required');
  assert(Array.isArray(items) && items.length > 0, 'Order must have at least one item');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the order while checking its current status and replacing its items.
    const [existing] = await conn.query(
      'SELECT status FROM orders WHERE order_id=? FOR UPDATE', [req.params.id]);
    assert(existing.length > 0, 'Order not found', 404);
    assert(!['Completed', 'Cancelled'].includes(existing[0].status),
      'Completed or cancelled orders cannot be edited');

    let total = 0;
    const normalized = [];
    // Rebuild the order items from validated product prices and quantities.
    for (const it of items) {
      assert(Number(it.product_id) > 0, 'product_id required');
      assert(isPositiveNumber(it.quantity_boxes), 'quantity_boxes must be > 0');

      const [prod] = await conn.query(
        'SELECT unit_price, available_stock, status FROM products WHERE product_id=?',
        [it.product_id]
      );
      assert(prod.length > 0, `Product ${it.product_id} not found`, 404);
      assert(prod[0].status === 'Active', `Product ${it.product_id} inactive`);
      assert(prod[0].available_stock >= it.quantity_boxes,
        `Insufficient stock for product ${it.product_id}`);

      const unit_price = Number(prod[0].unit_price);
      const subtotal = +(unit_price * it.quantity_boxes).toFixed(2);
      total += subtotal;
      normalized.push({
        product_id: it.product_id,
        quantity_boxes: it.quantity_boxes,
        unit_price, subtotal
      });
    }

    total = +total.toFixed(2);

    // Delete the old lines before inserting the new normalized lines.
    await conn.query('DELETE FROM order_items WHERE order_id=?', [req.params.id]);
    for (const n of normalized) {
      await conn.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity_boxes, unit_price, subtotal)
         VALUES (?,?,?,?,?)`,
        [req.params.id, n.product_id, n.quantity_boxes, n.unit_price, n.subtotal]
      );
    }
    await conn.query(
      'UPDATE orders SET vendor_id=?, order_date=?, total_amount=? WHERE order_id=?',
      [vendor_id, order_date, total, req.params.id]
    );

    await conn.commit();
    res.json({ message: 'Order updated', total_amount: total });
    // Undo all item and total changes if the update cannot finish.
  } catch (err) {
    await conn.rollback();
    throw err;
    // Always return the connection to the pool.
  } finally {
    conn.release();
  }
});

// Deletes an order unless it is completed, preserving the completed audit trail.
exports.remove = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT status FROM orders WHERE order_id=?',
    [req.params.id]);
  assert(rows.length > 0, 'Order not found', 404);
  assert(rows[0].status !== 'Completed',
    'Completed orders cannot be deleted (audit trail)');

  const [result] = await db.query('DELETE FROM orders WHERE order_id=?',
    [req.params.id]);
  assert(result.affectedRows > 0, 'Order not found', 404);
  res.json({ message: 'Order deleted' });
});
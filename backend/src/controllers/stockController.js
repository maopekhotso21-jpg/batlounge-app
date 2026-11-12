// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');
// Validates positive quantities and creates HTTP-aware errors.
const { isPositiveNumber, assert } = require('../utils/validators');

// Lists products with fruit and box-size details, search, and low-stock filters.
exports.getAll = asyncHandler(async (req, res) => {
  const { search = '', lowStock } = req.query;
  let sql = `
    SELECT p.product_id, p.unit_price, p.available_stock, p.status,
           f.fruit_id, f.fruit_name, b.box_size_id, b.size_name
    FROM products p
    JOIN fruits f ON f.fruit_id = p.fruit_id
    JOIN box_sizes b ON b.box_size_id = p.box_size_id
    WHERE 1=1
  `;
  const params = [];
  if (search) {
    sql += ' AND (f.fruit_name LIKE ? OR b.size_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (lowStock === 'true') sql += ' AND p.available_stock <= 20';
  sql += ' ORDER BY f.fruit_name, b.size_name';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// Lists purchase records together with supplier and product details.
exports.getPurchases = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT pu.purchase_id, pu.quantity, pu.cost_price, pu.purchase_date,
           s.supplier_id, s.supplier_name, s.province,
           p.product_id, f.fruit_name, b.size_name
    FROM purchases pu
    JOIN suppliers s ON s.supplier_id = pu.supplier_id
    JOIN products p ON p.product_id = pu.product_id
    JOIN fruits f ON f.fruit_id = p.fruit_id
    JOIN box_sizes b ON b.box_size_id = p.box_size_id
    ORDER BY pu.purchase_date DESC, pu.purchase_id DESC
  `);
  res.json(rows);
});

// Records a purchase and increases the related product stock atomically.
// The transaction ensures the purchase and stock update either both succeed or both roll back.
exports.addStock = asyncHandler(async (req, res) => {
  const { supplier_id, product_id, quantity, cost_price, purchase_date } = req.body;

  assert(Number.isInteger(Number(supplier_id)) && Number(supplier_id) > 0,
    'Valid supplier_id is required');
  assert(Number.isInteger(Number(product_id)) && Number(product_id) > 0,
    'Valid product_id is required');
  assert(isPositiveNumber(quantity), 'quantity must be greater than 0');
  assert(isPositiveNumber(cost_price), 'cost_price must be greater than 0');
  assert(purchase_date, 'purchase_date is required');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check both foreign-key records before inserting the purchase.
    const [sup] = await conn.query('SELECT supplier_id FROM suppliers WHERE supplier_id=?',
      [supplier_id]);
    assert(sup.length > 0, 'Supplier does not exist', 404);

    const [prod] = await conn.query('SELECT product_id FROM products WHERE product_id=?',
      [product_id]);
    assert(prod.length > 0, 'Product does not exist', 404);

    // Save the purchase history before applying its quantity to current stock.
    await conn.query(
      `INSERT INTO purchases (supplier_id, product_id, quantity, cost_price, purchase_date)
       VALUES (?,?,?,?,?)`,
      [supplier_id, product_id, quantity, cost_price, purchase_date]
    );
    await conn.query(
      'UPDATE products SET available_stock = available_stock + ? WHERE product_id=?',
      [quantity, product_id]
    );

    await conn.commit();
    res.status(201).json({ message: 'Stock added and product updated' });
    // Roll back every database change if any validation or query fails.
  } catch (err) {
    await conn.rollback();
    throw err;
    // Return the pooled connection even when the transaction fails.
  } finally {
    conn.release();
  }
});

// Updates a product's price, available quantity, and active status.
exports.updateProduct = asyncHandler(async (req, res) => {
  const { unit_price, available_stock, status } = req.body;
  assert(isPositiveNumber(unit_price), 'unit_price must be > 0');
  assert(!isNaN(available_stock) && Number(available_stock) >= 0,
    'available_stock must be >= 0');
  assert(['Active', 'Inactive'].includes(status), 'Invalid status');

  const [result] = await db.query(
    'UPDATE products SET unit_price=?, available_stock=?, status=? WHERE product_id=?',
    [unit_price, available_stock, status, req.params.id]
  );
  assert(result.affectedRows > 0, 'Product not found', 404);
  res.json({ message: 'Product updated' });
});
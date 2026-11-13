const express = require('express');
const router = express.Router();
const {
  getFruitQuantities,
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

// Route to get fruit quantities (MUST be before /:id)
router.get('/fruit-quantities', getFruitQuantities);

// Standard CRUD routes
router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

router.patch('/:id/status', updateOrderStatus);

module.exports = router;

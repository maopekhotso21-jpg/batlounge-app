// Creates the router for product-stock and purchase endpoints.
const router = require('express').Router();
// Contains the database handlers for stock operations.
const c = require('../controllers/stockController');
// Requires a valid JWT for every stock route.
const { authenticate } = require('../middleware/authMiddleware');
// Protects stock changes from non-admin users.
const { authorize } = require('../middleware/roleMiddleware');

// Applies authentication to all routes declared below.
router.use(authenticate);

router.get('/', c.getAll);
router.get('/purchases', c.getPurchases);
// Only administrators can record purchases or edit product stock.
router.post('/', authorize('Admin'), c.addStock);
router.put('/:id', authorize('Admin'), c.updateProduct);

// Exports the router for mounting under /api/stock.
module.exports = router;

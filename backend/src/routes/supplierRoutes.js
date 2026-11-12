// Creates the router for supplier endpoints.
const router = require('express').Router();
// Contains the database handlers for supplier operations.
const c = require('../controllers/supplierController');
// Requires a valid JWT for every supplier route.
const { authenticate } = require('../middleware/authMiddleware');
// Protects supplier changes from non-admin users.
const { authorize } = require('../middleware/roleMiddleware');

// Applies authentication to all routes declared below.
router.use(authenticate);

router.get('/', c.getAll);
router.get('/:id', c.getOne);
// Only administrators can add, edit, or delete suppliers.
router.post('/', authorize('Admin'), c.create);
router.put('/:id', authorize('Admin'), c.update);
router.delete('/:id', authorize('Admin'), c.remove);

// Exports the router for mounting under /api/suppliers.
module.exports = router;
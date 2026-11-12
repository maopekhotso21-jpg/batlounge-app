// Creates the router for fruit catalogue endpoints.
const router = require('express').Router();
// Contains the database handlers for fruit operations.
const c = require('../controllers/fruitController');
// Requires a valid JWT for every fruit route.
const { authenticate } = require('../middleware/authMiddleware');
// Protects write operations from non-admin users.
const { authorize } = require('../middleware/roleMiddleware');

// Applies authentication to all routes declared below.
router.use(authenticate);

router.get('/', c.getAll);
router.get('/:id', c.getOne);
// Only administrators can add, edit, or delete fruits.
router.post('/', authorize('Admin'), c.create);
router.put('/:id', authorize('Admin'), c.update);
router.delete('/:id', authorize('Admin'), c.remove);

// Exports the router for mounting under /api/fruits.
module.exports = router;
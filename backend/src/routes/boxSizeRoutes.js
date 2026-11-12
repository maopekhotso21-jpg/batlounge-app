// Creates the router for box-size catalogue endpoints.
const router = require('express').Router();
// Contains the database handlers for box-size operations.
const c = require('../controllers/boxSizeController');
// Requires a valid JWT for every box-size route.
const { authenticate } = require('../middleware/authMiddleware');
// Protects write operations from non-admin users.
const { authorize } = require('../middleware/roleMiddleware');

// Applies authentication to all routes declared below.
router.use(authenticate);

router.get('/', c.getAll);
router.get('/:id', c.getOne);
// Only administrators can add, edit, or delete box sizes.
router.post('/', authorize('Admin'), c.create);
router.put('/:id', authorize('Admin'), c.update);
router.delete('/:id', authorize('Admin'), c.remove);

// Exports the router for mounting under /api/box-sizes.
module.exports = router;
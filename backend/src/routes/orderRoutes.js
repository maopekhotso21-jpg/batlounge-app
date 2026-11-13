// Creates the router for order endpoints.
const router = require('express').Router();
// Contains the database handlers for order operations.
const c = require('../controllers/orderController');
// Requires a valid JWT for every order route.
const { authenticate } = require('../middleware/authMiddleware');

// Applies authentication to all routes declared below.
router.use(authenticate);

router.get('/', c.getAll);
<<<<<<< HEAD
router.get('/fruit-quantities', c.fruitQuantities);
=======
>>>>>>> 9eb0d96ef5a0b1fe3d8fd7867d536603b82fa08d
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.patch('/:id/status', c.updateStatus);
router.delete('/:id', c.remove);

// Exports the router for mounting under /api/orders.
module.exports = router;
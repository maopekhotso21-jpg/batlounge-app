// Creates the router for street-vendor endpoints.
const router = require('express').Router();
// Contains the database handlers for vendor operations.
const c = require('../controllers/vendorController');
// Requires a valid JWT for every vendor route.
const { authenticate } = require('../middleware/authMiddleware');

// Applies authentication to all routes declared below.
router.use(authenticate);

router.get('/', c.getAll);
router.get('/:id', c.getOne);
// Both Admin and Sales users can register vendors.
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

// Exports the router for mounting under /api/vendors.
module.exports = router;

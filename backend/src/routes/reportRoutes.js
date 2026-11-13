// Creates the router for administrator reporting endpoints.
const router = require('express').Router();
// Contains the SQL aggregation handlers for each report.
const c = require('../controllers/reportController');
// Requires a valid JWT before report access is considered.
const { authenticate } = require('../middleware/authMiddleware');
// Reports contain sensitive business information, so only Admin is allowed.
const { authorize } = require('../middleware/roleMiddleware');

// Applies authentication and administrator authorization to every report route.
router.use(authenticate);
router.use(authorize('Admin'));

router.get('/dashboard', c.dashboard);
router.get('/sales-by-box-size', c.salesByBoxSize);
router.get('/sales-by-vendor', c.salesByVendor);
router.get('/purchases-by-province', c.purchasesByProvince);
router.get('/pending-orders', c.pendingOrders);
router.get('/completed-orders', c.completedOrders);
router.get('/total-sales-by-date', c.totalSalesByDate);
router.get('/top-selling-fruits', c.topSellingFruits);

// Exports the router for mounting under /api/reports.
module.exports = router;

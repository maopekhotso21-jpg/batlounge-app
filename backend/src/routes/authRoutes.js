// Creates an isolated Express router for authentication endpoints.
const router = require('express').Router();
// Provides login, registration, profile, and password-change handlers.
const c = require('../controllers/authController');
// Verifies the JWT for protected authentication endpoints.
const { authenticate } = require('../middleware/authMiddleware');
// Restricts registration to administrators.
const { authorize } = require('../middleware/roleMiddleware');

// Login is public because a token does not exist yet.
router.post('/login', c.login);

// PUBLIC self-signup - open to anyone. Forces role to "Sales" internally.
router.post('/signup', c.signup);

// Only an authenticated administrator can create another user (any role).
router.post('/register', authenticate, authorize('Admin'), c.register);

// Returns the currently authenticated user's public profile.
router.get('/me', authenticate, c.me);
// Changes the password for the authenticated user.
router.put('/change-password', authenticate, c.changePassword);

// Exports the router for mounting under /api/auth.
module.exports = router;
// Creates middleware that permits only the supplied roles.
// Example: authorize('Admin') or authorize('Admin', 'Sales').
exports.authorize = (...allowedRoles) => (req, res, next) => {
  // Authentication must run before authorization so req.user exists.
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  // A valid user still receives 403 when their role is not permitted here.
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Forbidden: requires role ${allowedRoles.join(' or ')}`
    });
  }
  next();
};
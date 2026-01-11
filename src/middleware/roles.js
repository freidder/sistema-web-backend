// simple role check middleware
const checkRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Forbidden - no role' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden - insufficient role' });
  }

  next();
};

module.exports = checkRole;

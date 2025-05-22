const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required.`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error.message,
      });
    }
  };
};

module.exports = authorizeRole;

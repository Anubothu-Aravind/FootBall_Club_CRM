const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.coach = decoded; // Contains id, email, and role
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to check for specific roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.coach) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.coach.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(" or ")}` 
      });
    }
    next();
  };
};

module.exports = auth;
module.exports.requireRole = requireRole;

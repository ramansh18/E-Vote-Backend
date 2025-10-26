const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// ✅ Middleware to protect any logged-in user route
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin, 
    };
    next(); // ✅ Proceed without checking admin here
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized" });
  }
};

// ✅ Middleware to allow only admins
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

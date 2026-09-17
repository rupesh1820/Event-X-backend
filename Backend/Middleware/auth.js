import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "eventx-development-secret";

export const requireAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";

    console.log("Authorization Header:", authorization);

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("Decoded Token:", decoded);

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      emailAddress: decoded.emailAddress,
    };

    console.log("Authenticated User:", req.user);

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  return next();
};
import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];  // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: "Access denied, no token provided!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token!" });
  }
};

export default authenticateJWT;

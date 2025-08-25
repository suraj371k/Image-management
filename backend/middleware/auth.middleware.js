

export const authenticate = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required. No token provided." });
  }
  const parts = token.split(".");
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Invalid token format." });
  }

  req.user = parts[0];

  next();
};


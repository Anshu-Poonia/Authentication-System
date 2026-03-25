import jwt from "jsonwebtoken";

// Middleware to authenticate user using JWT token
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  // if token is not present, then return error
  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again"});
  }

  try {
    // verify token and decode it
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorized. Login Again"});
    }

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;

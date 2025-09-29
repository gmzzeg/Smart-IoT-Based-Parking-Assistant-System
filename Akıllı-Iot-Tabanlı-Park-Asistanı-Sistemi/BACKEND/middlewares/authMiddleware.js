// middlewares/isAuth.js
import JWT from 'jsonwebtoken';
import User from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      console.log("Token yok");
      return res.status(401).json({ success: false, message: 'UnAuthorized User' });
    }

    const decodeData = JWT.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decodeData);

    const user = await User.findByPk(decodeData.id);
    console.log("🔍 Veritabanından gelen user:", user);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Middleware error:", error.message);
    return res.status(500).json({ success: false, message: 'Authentication error', error: error.message });
  }
};

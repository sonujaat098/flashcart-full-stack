import jwt from "jsonwebtoken";
import { isDatabaseReady } from "../db.js";
import User from "../models/User.js";

export function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString()
    },
    process.env.JWT_SECRET || "dev-secret-change-me",
    {
      expiresIn: "7d"
    }
  );
}

export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone
  };
}

export async function authenticate(request, response, next) {
  try {
    if (!isDatabaseReady()) {
      response.status(503).json({
        message: "MongoDB is not connected. Set MONGODB_URI in backend/.env or start local MongoDB, then restart the backend."
      });
      return;
    }

    const authHeader = request.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      response.status(401).json({
        message: "Please login to continue"
      });
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    const user = await User.findById(payload.userId);

    if (!user) {
      response.status(401).json({
        message: "Your session has expired. Please login again."
      });
      return;
    }

    request.user = user;
    next();
  } catch (error) {
    response.status(401).json({
      message: "Your session has expired. Please login again."
    });
  }
}

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      req.user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({ message: "Insufficient permissions" });
        return;
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  };
};

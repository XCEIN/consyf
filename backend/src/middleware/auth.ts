import { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    return;
  }

  try {
    const jwtSecret: Secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    return;
  }
};

// Middleware to check if user is admin
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // This will be implemented after we add role column to users table
  // For now, we'll just check if user is authenticated
  if (!req.user) {
    res.status(401).json({ message: 'Yêu cầu xác thực' });
    return;
  }
  next();
};

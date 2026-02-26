import { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    accountType: 'user' | 'admin' | 'editor';
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
      accountType: decoded.accountType || 'user',
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
  if (!req.user || req.user.accountType !== 'admin') {
    res.status(403).json({ message: 'Yêu cầu quyền quản trị' });
    return;
  }
  next();
};

export const requireEditor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.accountType !== 'editor') {
    res.status(403).json({ message: 'Yêu cầu quyền editor' });
    return;
  }
  next();
};

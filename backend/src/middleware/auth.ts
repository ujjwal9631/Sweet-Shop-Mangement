import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        res.status(401).json({ message: 'User not found. Invalid token.' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      res.status(401).json({ message: 'Invalid or expired token.' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Authentication error.' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required.' });
    return;
  }

  next();
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

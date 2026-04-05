import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded; // Assuming the decoded token contains user information
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id; // Assuming user ID is stored in the token

  if (!userId) {
    return res.status(403).json({ success: false, message: 'Access denied. User not found.' });
  }

  const user = await User.findById(userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  next();
};
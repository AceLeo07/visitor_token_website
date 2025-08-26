import { RequestHandler } from "express";
import { db } from "./database";

// Simple password verification (In production, use bcrypt)
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  // Simplified verification - in production use bcrypt.compare
  const passwordMap: { [key: string]: string } = {
    '$2b$10$hash1': 'password123',
    '$2b$10$hash2': 'password123',
    '$2b$10$hash3': 'password123',
    '$2b$10$hash4': 'password123',
    '$2b$10$hash5': 'password123',
    '$2b$10$hashadmin': 'admin123',
    '$2b$10$hashsec1': 'security123',
    '$2b$10$hashsec2': 'security123'
  };
  return passwordMap[hashedPassword] === plainPassword;
}

// Simple JWT token generation (In production, use proper JWT library)
export function generateToken(userId: string, role: string): string {
  const payload = {
    userId,
    role,
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Simple JWT token verification
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    // Check if token is less than 24 hours old
    const tokenAge = Date.now() - payload.timestamp;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return null;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

// Authentication middleware
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }

  // Attach user info to request
  (req as any).user = decoded;
  next();
};

// Role-based access control
export function requireRole(role: string): RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

// Admin access control (requires admin role OR faculty with admin privileges)
export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(403).json({ success: false, message: 'Authentication required' });
  }

  if (user.role === 'admin') {
    return next();
  }

  if (user.role === 'faculty') {
    const faculty = db.getFacultyById(user.userId);
    if (faculty?.isAdmin) {
      return next();
    }
  }

  return res.status(403).json({ success: false, message: 'Admin access required' });
};

import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase.service.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is required.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Support local demo / test token for local offline development and automated test suites
  if (token.startsWith('demo-token') || token.startsWith('test-token')) {
    req.user = {
      id: DEMO_USER_ID,
      email: 'security.admin@scopeseal.test',
      role: 'security_officer'
    };
    return next();
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired session token.'
        });
        return;
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || 'authenticated'
      };
      return next();
    } catch (err) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Failed to verify authentication token.'
      });
      return;
    }
  }

  // If Supabase is not configured and token is provided in dev mode, grant authenticated session
  if (process.env.NODE_ENV !== 'production') {
    req.user = {
      id: DEMO_USER_ID,
      email: 'demo@scopeseal.local',
      role: 'security_officer'
    };
    return next();
  }

  res.status(503).json({
    error: 'Service Unavailable',
    message: 'Authentication provider is not configured.'
  });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  requireAuth(req, res, next).catch(next);
}

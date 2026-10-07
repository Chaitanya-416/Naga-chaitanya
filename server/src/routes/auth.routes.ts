import { Router, Request, Response, NextFunction } from 'express';
import { LoginInputSchema, RegisterInputSchema } from '@scopeseal/shared';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase.service.js';
import { requireAuth, DEMO_USER_ID } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.use(authLimiter);

/**
 * POST /api/v1/auth/session
 * Establish or verify session
 */
authRouter.post('/session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.issues
      });
      return;
    }

    const { email, password } = parsed.data;
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        res.status(401).json({
          error: 'AuthenticationFailed',
          message: error.message
        });
        return;
      }

      res.status(200).json({
        token: data.session?.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role || 'security_officer'
        }
      });
      return;
    }

    // Resilient Local / Demo Auth Fallback
    const demoToken = `demo-token-${Date.now()}-${Buffer.from(email).toString('hex')}`;
    res.status(200).json({
      token: demoToken,
      user: {
        id: DEMO_USER_ID,
        email,
        role: 'security_officer'
      },
      message: 'Logged in using ScopeSeal Local Security Authority'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/register
 * Register new user
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.issues
      });
      return;
    }

    const { email, password, fullName } = parsed.data;
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'ScopeSeal User'
          }
        }
      });

      if (error) {
        res.status(400).json({
          error: 'RegistrationFailed',
          message: error.message
        });
        return;
      }

      res.status(201).json({
        token: data.session?.access_token,
        user: {
          id: data.user?.id || DEMO_USER_ID,
          email: data.user?.email || email,
          role: 'security_officer'
        }
      });
      return;
    }

    // Local / Demo registration fallback
    const demoToken = `demo-token-${Date.now()}-${Buffer.from(email).toString('hex')}`;
    res.status(201).json({
      token: demoToken,
      user: {
        id: DEMO_USER_ID,
        email,
        fullName: fullName || 'ScopeSeal User',
        role: 'security_officer'
      },
      message: 'User registered successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/me
 * Retrieve currently authenticated user context
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user
  });
});

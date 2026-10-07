import { Router, Request, Response, NextFunction } from 'express';
import { PolicyInputSchema } from '@scopeseal/shared';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const policyRouter = Router();

policyRouter.use(requireAuth);

/**
 * GET /api/v1/policies
 */
policyRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const policies = store.getPolicies(userId);
  res.status(200).json(policies);
});

/**
 * PUT /api/v1/policies/:id
 */
policyRouter.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const parsed = PolicyInputSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const updated = store.updatePolicy(id, userId, parsed.data);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: `Policy with ID '${id}' not found.` });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

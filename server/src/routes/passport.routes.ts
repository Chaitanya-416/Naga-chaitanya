import { Router, Request, Response, NextFunction } from 'express';
import { PurposePassportInputSchema } from '@scopeseal/shared';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const passportRouter = Router();

passportRouter.use(requireAuth);

/**
 * GET /api/v1/passports
 */
passportRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const passports = store.getPassports(userId);
  res.status(200).json(passports);
});

/**
 * POST /api/v1/passports
 */
passportRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = PurposePassportInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const created = store.createPassport(userId, parsed.data);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/passports/:id
 */
passportRouter.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const parsed = PurposePassportInputSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const updated = store.updatePassport(id, userId, parsed.data);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: `Passport with ID '${id}' not found.` });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/passports/:id
 */
passportRouter.delete('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const deleted = store.deletePassport(id, userId);
  if (!deleted) {
    res.status(404).json({ error: 'NotFound', message: `Passport with ID '${id}' not found.` });
    return;
  }
  res.status(200).json({ success: true, message: `Passport '${id}' deleted.` });
});

import { Router, Request, Response } from 'express';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const ledgerRouter = Router();

ledgerRouter.use(requireAuth);

/**
 * GET /api/v1/ledger
 */
ledgerRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const events = store.getLedgerEvents(userId);
  res.status(200).json(events);
});

/**
 * GET /api/v1/ledger/:id
 */
ledgerRouter.get('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const events = store.getLedgerEvents(userId);
  const event = events.find((e) => e.id === req.params.id);

  if (!event) {
    res.status(404).json({ error: 'NotFound', message: `Ledger event '${req.params.id}' not found.` });
    return;
  }

  res.status(200).json(event);
});

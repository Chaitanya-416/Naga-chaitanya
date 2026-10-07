import { Router, Request, Response, NextFunction } from 'express';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const agentRouter = Router();

agentRouter.use(requireAuth);

/**
 * GET /api/v1/agents
 */
agentRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const agents = store.getAgents(userId);
  res.status(200).json(agents);
});

/**
 * GET /api/v1/agents/candidates (Synthetic recruitment candidates for simulator)
 */
agentRouter.get('/candidates', (req: Request, res: Response) => {
  const candidates = store.getCandidates();
  res.status(200).json(candidates);
});

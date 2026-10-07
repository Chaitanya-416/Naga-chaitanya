import { Router, Request, Response, NextFunction } from 'express';
import { RunSimulationInputSchema } from '@scopeseal/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { runPolicySimulation } from '../engine/simulationEngine.js';

export const simulationRouter = Router();

simulationRouter.use(requireAuth);

/**
 * POST /api/v1/policy-simulation/run
 * Computes What-If counterfactual outcomes without mutating database or executing tools
 */
simulationRouter.post('/run', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = RunSimulationInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const result = runPolicySimulation(userId, parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

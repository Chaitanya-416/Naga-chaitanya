import { Router, Request, Response, NextFunction } from 'express';
import { EvaluateActionInputSchema, ExecuteActionInputSchema } from '@scopeseal/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { gatewayLimiter } from '../middleware/rateLimiter.js';
import { evaluateGatewayAction } from '../engine/gatewayEngine.js';
import { executeGatewayAction } from '../engine/executionEngine.js';

export const gatewayRouter = Router();

gatewayRouter.use(requireAuth);
gatewayRouter.use(gatewayLimiter);

/**
 * POST /api/v1/gateway/evaluate-action
 * Intercepts proposed agent action and executes zero-trust evaluation pipeline
 */
gatewayRouter.post('/evaluate-action', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = EvaluateActionInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const evaluation = await evaluateGatewayAction(userId, parsed.data);
    res.status(200).json(evaluation);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/gateway/execute-action
 * Executes proposed action ONLY if deterministically verified or valid single-use approval provided
 */
gatewayRouter.post('/execute-action', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = ExecuteActionInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const result = await executeGatewayAction(userId, parsed.data);
    if (!result.success) {
      res.status(403).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

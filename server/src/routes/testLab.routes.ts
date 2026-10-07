import { Router, Request, Response, NextFunction } from 'express';
import { RunTestScenarioInputSchema } from '@scopeseal/shared';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { runScenario, SECURITY_SCENARIOS } from '../engine/testLabEngine.js';

export const testLabRouter = Router();

testLabRouter.use(requireAuth);

/**
 * GET /api/v1/test-lab/scenarios
 */
testLabRouter.get('/scenarios', (req: Request, res: Response) => {
  const scenarios = Object.values(SECURITY_SCENARIOS).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    threatCategory: s.threatCategory,
    expectedDecision: s.expectedDecision
  }));
  res.status(200).json(scenarios);
});

/**
 * GET /api/v1/test-lab/results
 */
testLabRouter.get('/results', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const results = store.getSecurityTests(userId);
  res.status(200).json(results);
});

/**
 * POST /api/v1/test-lab/run-scenario
 */
testLabRouter.post('/run-scenario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = RunTestScenarioInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
      return;
    }

    const testResult = await runScenario(userId, parsed.data.scenarioId);
    res.status(200).json(testResult);
  } catch (err) {
    next(err);
  }
});

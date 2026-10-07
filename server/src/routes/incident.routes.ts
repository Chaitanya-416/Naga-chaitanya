import { Router, Request, Response } from 'express';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const incidentRouter = Router();

incidentRouter.use(requireAuth);

/**
 * GET /api/v1/incidents
 */
incidentRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const incidents = store.getIncidents(userId);
  res.status(200).json(incidents);
});

/**
 * GET /api/v1/incidents/:id
 */
incidentRouter.get('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const incidents = store.getIncidents(userId);
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    res.status(404).json({ error: 'NotFound', message: `Incident '${req.params.id}' not found.` });
    return;
  }

  res.status(200).json(incident);
});

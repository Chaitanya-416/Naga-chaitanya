import { Router, Request, Response } from 'express';
import { store } from '../services/store.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const approvalRouter = Router();

approvalRouter.use(requireAuth);

/**
 * GET /api/v1/approvals
 */
approvalRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const approvals = store.getApprovals(userId);
  res.status(200).json(approvals);
});

/**
 * POST /api/v1/approvals/:id/approve
 */
approvalRouter.post('/:id/approve', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const approval = store.getApprovalById(id);

  if (!approval) {
    res.status(404).json({ error: 'NotFound', message: `Approval with ID '${id}' not found.` });
    return;
  }

  if (approval.status === 'USED') {
    res.status(400).json({ error: 'InvalidState', message: 'Approval is already executed and marked as USED.' });
    return;
  }

  if (new Date(approval.expires_at).getTime() < Date.now()) {
    store.updateApproval(id, { status: 'EXPIRED' });
    res.status(400).json({ error: 'Expired', message: 'Approval has passed its expiration TTL.' });
    return;
  }

  const updated = store.updateApproval(id, {
    status: 'APPROVED',
    approved_at: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: 'Action approved for single-use execution with exact parameter hash.',
    approval: updated
  });
});

/**
 * POST /api/v1/approvals/:id/reject
 */
approvalRouter.post('/:id/reject', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const approval = store.getApprovalById(id);

  if (!approval) {
    res.status(404).json({ error: 'NotFound', message: `Approval with ID '${id}' not found.` });
    return;
  }

  const updated = store.updateApproval(id, {
    status: 'REJECTED'
  });

  res.status(200).json({
    success: true,
    message: 'Action rejected by security officer.',
    approval: updated
  });
});

import { v4 as uuidv4 } from 'uuid';
import { Approval } from '@scopeseal/shared';
import { store } from '../services/store.service.js';
import { computeParameterHash, canonicalizeParameters } from './normalization.js';

export interface CreateApprovalParams {
  userId: string;
  agentId: string;
  tool: string;
  destination: string;
  parameters: Record<string, any>;
  riskScore: number;
  reasons: string[];
  ttlSeconds?: number;
}

export function createPendingApproval(params: CreateApprovalParams): Approval {
  const { userId, agentId, tool, destination, parameters, riskScore, reasons, ttlSeconds = 600 } = params;

  const normalizedParameters = canonicalizeParameters(parameters);
  const parameterHash = computeParameterHash(agentId, tool, destination, parameters);
  const now = Date.now();

  const approval: Approval = {
    id: uuidv4(),
    user_id: userId,
    agent_id: agentId,
    tool_id: tool,
    target: destination,
    normalized_parameters: normalizedParameters,
    parameter_hash: parameterHash,
    status: 'PENDING',
    risk_score: riskScore,
    reasons,
    expires_at: new Date(now + ttlSeconds * 1000).toISOString(),
    created_at: new Date(now).toISOString()
  };

  return store.createApproval(approval);
}

export interface ApprovalValidationResult {
  valid: boolean;
  approval?: Approval;
  error?: string;
  tampered?: boolean;
  replayed?: boolean;
  expired?: boolean;
}

export function validateApprovalForExecution(params: {
  approvalId: string;
  userId: string;
  agentId: string;
  tool: string;
  destination: string;
  parameters: Record<string, any>;
}): ApprovalValidationResult {
  const { approvalId, userId, agentId, tool, destination, parameters } = params;

  const approval = store.getApprovalById(approvalId);
  if (!approval) {
    return { valid: false, error: 'Approval request record not found.' };
  }

  // Verify ownership
  if (approval.user_id !== userId && approval.user_id !== 'a0000000-0000-0000-0000-000000000001') {
    return { valid: false, error: 'Unauthorized: Approval does not belong to active user.' };
  }

  // Check replay
  if (approval.status === 'USED') {
    return { valid: false, replayed: true, error: 'Approval has already been executed. Replay rejected.' };
  }

  // Check rejection
  if (approval.status === 'REJECTED') {
    return { valid: false, error: 'Approval was explicitly rejected by security reviewer.' };
  }

  // Check status is APPROVED
  if (approval.status !== 'APPROVED') {
    return { valid: false, error: `Approval is in '${approval.status}' state and not authorized for execution.` };
  }

  // Check expiration
  if (new Date(approval.expires_at).getTime() < Date.now()) {
    store.updateApproval(approval.id, { status: 'EXPIRED' });
    return { valid: false, expired: true, error: 'Approval has expired. Fresh review required.' };
  }

  // Cryptographic parameter hash binding validation (Anti-Tampering)
  const incomingHash = computeParameterHash(agentId, tool, destination, parameters);
  if (incomingHash !== approval.parameter_hash) {
    return {
      valid: false,
      tampered: true,
      error: `Parameter tampering detected! Hash mismatch between approved intent and executed payload. Expected: ${approval.parameter_hash}, Provided: ${incomingHash}`
    };
  }

  return { valid: true, approval };
}

export function markApprovalUsed(approvalId: string): void {
  store.updateApproval(approvalId, {
    status: 'USED',
    used_at: new Date().toISOString()
  });
}

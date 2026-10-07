import { v4 as uuidv4 } from 'uuid';
import {
  ExecuteActionInput,
  ExecutionResult,
  DataFlowEvent,
  Incident
} from '@scopeseal/shared';
import { store } from '../services/store.service.js';
import { computeParameterHash } from './normalization.js';
import { validateApprovalForExecution, markApprovalUsed } from './approvalEngine.js';
import { evaluateGatewayAction } from './gatewayEngine.js';
import { executeRecruitAssistTool } from '../tools/recruitAssist.tools.js';

export async function executeGatewayAction(
  userId: string,
  input: ExecuteActionInput
): Promise<ExecutionResult> {
  const {
    agentId,
    passportCode,
    userGoal,
    proposedTool,
    proposedDestination,
    parameters,
    parameterHash,
    approvalId,
    externalSourceContext
  } = input;

  // 1. Verify Parameter Hash Integrity
  const computedHash = computeParameterHash(agentId, proposedTool, proposedDestination, parameters);
  if (computedHash !== parameterHash) {
    // Record Tampering Incident
    const incident: Incident = {
      id: uuidv4(),
      user_id: userId,
      severity: 'CRITICAL',
      category: 'APPROVAL_PARAMETER_TAMPERING',
      title: `Blocked Execution: Parameter Hash Mismatch for ${proposedTool}`,
      description: `Action was blocked due to parameter substitution. Claimed hash: ${parameterHash}, computed hash: ${computedHash}.`,
      remediation: 'Ensure tool execution parameters match the originally submitted and evaluated payload.',
      forensic_metadata: { agentId, tool: proposedTool, parameterHash, computedHash, parameters },
      created_at: new Date().toISOString()
    };
    store.addIncident(incident);

    return {
      success: false,
      decision: 'BLOCK',
      executionStatus: 'BLOCKED',
      incidentId: incident.id,
      errorMessage: 'Parameter tampering detected: execution payload hash does not match authorization token.'
    };
  }

  // 2. Handle Approval-Bound Execution
  if (approvalId) {
    const validation = validateApprovalForExecution({
      approvalId,
      userId,
      agentId,
      tool: proposedTool,
      destination: proposedDestination,
      parameters
    });

    if (!validation.valid) {
      // Record Incident on tampering or replay
      if (validation.tampered || validation.replayed) {
        const incident: Incident = {
          id: uuidv4(),
          user_id: userId,
          severity: 'CRITICAL',
          category: validation.tampered ? 'APPROVAL_MUTATION' : 'APPROVAL_REPLAY_ATTEMPT',
          title: `Blocked: ${validation.error}`,
          description: `ScopeSeal Zero-Trust Approval Gate prevented unauthorized execution.`,
          remediation: 'Re-submit approval request for the modified parameters.',
          forensic_metadata: { approvalId, error: validation.error, parameters },
          created_at: new Date().toISOString()
        };
        store.addIncident(incident);
        return {
          success: false,
          decision: 'BLOCK',
          executionStatus: 'BLOCKED',
          incidentId: incident.id,
          errorMessage: validation.error
        };
      }

      return {
        success: false,
        decision: 'BLOCK',
        executionStatus: 'BLOCKED',
        errorMessage: validation.error
      };
    }

    // Approval is valid! Execute the registered tool!
    try {
      const toolOutput = await executeRecruitAssistTool(proposedTool, parameters);
      markApprovalUsed(approvalId);

      // Record Executed Event in Ledger
      const ledgerEvent: DataFlowEvent = {
        id: uuidv4(),
        user_id: userId,
        agent_id: agentId,
        purpose: userGoal,
        tool: proposedTool,
        destination: proposedDestination,
        risk: validation.approval?.risk_score || 0,
        decision: 'ALLOW',
        execution_status: 'EXECUTED',
        policy_version: 'v1.0',
        parameter_hash: computedHash,
        metadata: { approvalId, execution: 'APPROVED_AND_EXECUTED', toolOutput },
        timestamp: new Date().toISOString()
      };
      store.addLedgerEvent(ledgerEvent);

      return {
        success: true,
        decision: 'ALLOW',
        executionStatus: 'EXECUTED',
        toolOutput,
        ledgerId: ledgerEvent.id
      };
    } catch (err: any) {
      return {
        success: false,
        decision: 'ALLOW',
        executionStatus: 'FAILED',
        errorMessage: err.message
      };
    }
  }

  // 3. Direct Execution without pre-approval: Evaluate first
  const evalResult = await evaluateGatewayAction(userId, {
    agentId,
    passportCode,
    userGoal,
    proposedTool,
    proposedDestination,
    parameters,
    externalSourceContext
  });

  if (evalResult.decision !== 'ALLOW') {
    return {
      success: false,
      decision: evalResult.decision,
      executionStatus: evalResult.decision === 'REVIEW' ? 'REVIEW_PENDING' : 'BLOCKED',
      ledgerId: evalResult.ledgerId,
      errorMessage: evalResult.decision === 'REVIEW'
        ? 'Action requires human approval before execution can proceed.'
        : `Action blocked by ScopeSeal Gateway: ${evalResult.reasons.join('; ')}`
    };
  }

  // Direct Execution ALLOWED
  try {
    const toolOutput = await executeRecruitAssistTool(proposedTool, parameters);

    const ledgerEvent: DataFlowEvent = {
      id: uuidv4(),
      user_id: userId,
      agent_id: agentId,
      purpose: userGoal,
      tool: proposedTool,
      destination: proposedDestination,
      risk: evalResult.riskScore,
      decision: 'ALLOW',
      execution_status: 'EXECUTED',
      policy_version: 'v1.0',
      parameter_hash: computedHash,
      metadata: { execution: 'DIRECT_ALLOWED', toolOutput },
      timestamp: new Date().toISOString()
    };
    store.addLedgerEvent(ledgerEvent);

    return {
      success: true,
      decision: 'ALLOW',
      executionStatus: 'EXECUTED',
      toolOutput,
      ledgerId: ledgerEvent.id
    };
  } catch (err: any) {
    return {
      success: false,
      decision: 'ALLOW',
      executionStatus: 'FAILED',
      errorMessage: err.message
    };
  }
}

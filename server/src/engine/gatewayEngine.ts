import { v4 as uuidv4 } from 'uuid';
import {
  EvaluateActionInput,
  EvaluationResult,
  Decision,
  RiskLevel,
  RECRUIT_ASSIST_TOOLS,
  DataFlowEvent,
  Incident
} from '@scopeseal/shared';
import { store } from '../services/store.service.js';
import { computeParameterHash, canonicalizeParameters } from './normalization.js';
import { evaluateRisk, EvaluatedRiskFactors } from './riskEngine.js';
import {
  analyzePurposeDrift,
  detectAdversarialInstructions,
  classifySensitivity,
  generateExplanation
} from '../services/gemini.service.js';
import { createPendingApproval } from './approvalEngine.js';

export async function evaluateGatewayAction(
  userId: string,
  input: EvaluateActionInput
): Promise<EvaluationResult> {
  const {
    agentId,
    passportCode,
    userGoal,
    proposedTool,
    proposedDestination,
    parameters,
    externalSourceContext,
    approvalToken
  } = input;

  const policyViolations: string[] = [];
  const reasons: string[] = [];

  // 1. Parameter Normalization & Hash Binding
  const normalizedParams = canonicalizeParameters(parameters);
  const parameterHash = computeParameterHash(agentId, proposedTool, proposedDestination, parameters);

  // 2. Purpose Passport Resolution
  const passport = store.getPassportByCode(passportCode);
  if (!passport) {
    policyViolations.push(`Purpose Passport '${passportCode}' does not exist.`);
  } else if (!passport.active) {
    policyViolations.push(`Purpose Passport '${passportCode}' is inactive.`);
  } else if (new Date(passport.expires_at).getTime() < Date.now()) {
    policyViolations.push(`Purpose Passport '${passportCode}' has expired on ${passport.expires_at}.`);
  }

  // 3. Registered Tool Check
  const toolDef = RECRUIT_ASSIST_TOOLS[proposedTool];
  if (!toolDef) {
    policyViolations.push(`Tool '${proposedTool}' is not registered in the ScopeSeal security perimeter.`);
  }

  // 4. Fetch Active Policy Configuration
  const activePolicy = store.getActivePolicy(userId);
  const weights = activePolicy.weights;
  const thresholds = activePolicy.thresholds;

  // 5. Semantic & Adversarial AI Analysis
  const authorizedPurpose = passport ? passport.authorized_purpose : 'Undefined purpose';

  const [driftAnalysis, adversarialAnalysis, sensitivityAnalysis] = await Promise.all([
    analyzePurposeDrift({
      userGoal,
      authorizedPurpose,
      proposedTool,
      destination: proposedDestination,
      parameters,
      externalSourceContext
    }),
    detectAdversarialInstructions(externalSourceContext || ''),
    classifySensitivity(parameters)
  ]);

  // 6. Evaluate Risk Factors
  const isOperationAllowedInPassport = Boolean(
    passport && passport.allowed_operations.includes(proposedTool)
  );

  const isDestinationAllowed = Boolean(
    passport &&
    (passport.allowed_destinations.includes(proposedDestination) ||
     proposedDestination.startsWith('internal://'))
  );

  const isExternalDestination = !proposedDestination.startsWith('internal://');
  const isHighImpactTool = toolDef ? ['export', 'external'].includes(toolDef.operationClass) : true;

  const isExcessiveScope = Boolean(
    parameters.recordCount && parameters.recordCount > 10 ||
    parameters.exportAll === true ||
    (typeof parameters.candidateIds === 'object' && Object.keys(parameters.candidateIds).length > 20)
  );

  // Purpose Mismatch
  const purposeMismatch = !isOperationAllowedInPassport || driftAnalysis.purposeDriftDetected;

  // Sensitive Data Exposure (From Passport classification or Payload sensitivity scanner)
  const passportSensitivity = passport?.sensitivity_level || 'INTERNAL';
  const sensitiveDataExposure =
    passportSensitivity === 'RESTRICTED' ||
    (passportSensitivity === 'CONFIDENTIAL' && isExternalDestination) ||
    sensitivityAnalysis.sensitivity === 'RESTRICTED' ||
    (sensitivityAnalysis.sensitivity === 'CONFIDENTIAL' && isExternalDestination);

  // Untrusted Instruction Source (Prompt Injection / Adversarial override)
  const untrustedInstructionSource = adversarialAnalysis.untrustedInstructionDetected;

  // Missing or Invalid Approval
  const requiresApproval = passport?.approval_required || isHighImpactTool || isExternalDestination;
  const missingOrInvalidApproval = requiresApproval && !approvalToken;

  const riskFactors: EvaluatedRiskFactors = {
    purposeMismatch,
    sensitiveDataExposure,
    externalDestination: isExternalDestination && !isDestinationAllowed,
    highImpactOperation: isHighImpactTool,
    untrustedInstructionSource,
    excessiveScope: isExcessiveScope,
    missingOrInvalidApproval
  };

  const isLowImpactRead = toolDef?.operationClass === 'read' && !isExternalDestination;

  // 7. Deterministic Risk Score Computation
  const riskEval = evaluateRisk(riskFactors, weights, thresholds, isLowImpactRead);
  let { riskScore, riskLevel, decision } = riskEval;

  // Untrusted external instructions attempting high-impact tools or exfiltration must ALWAYS be blocked
  if (untrustedInstructionSource && (isHighImpactTool || isExternalDestination)) {
    decision = 'BLOCK';
    riskScore = Math.max(riskScore, 85);
    riskLevel = 'CRITICAL';
    policyViolations.push('Blocked untrusted external prompt injection attempting privileged operation.');
  }

  // Absolute Violations override decision to BLOCK
  if (policyViolations.length > 0) {
    decision = 'BLOCK';
    riskScore = Math.max(riskScore, 90);
    riskLevel = 'CRITICAL';
    reasons.push(...policyViolations);
  }

  reasons.push(...riskEval.reasons);
  if (driftAnalysis.reasons.length > 0) {
    reasons.push(...driftAnalysis.reasons);
  }
  if (adversarialAnalysis.reasons.length > 0 && adversarialAnalysis.untrustedInstructionDetected) {
    reasons.push(...adversarialAnalysis.reasons);
  }

  // Deduplicate reasons
  const uniqueReasons = Array.from(new Set(reasons));

  // 8. Generate Human-Readable Security Explanation
  const explanation = await generateExplanation(riskScore, decision, uniqueReasons);

  // 9. If REVIEW: Automatically generate parameter-bound Approval ticket
  let approvalId: string | undefined;
  if (decision === 'REVIEW') {
    const approval = createPendingApproval({
      userId,
      agentId,
      tool: proposedTool,
      destination: proposedDestination,
      parameters,
      riskScore,
      reasons: uniqueReasons
    });
    approvalId = approval.id;
  }

  // 10. Record Data Flow Event in Ledger
  const ledgerEvent: DataFlowEvent = {
    id: uuidv4(),
    user_id: userId,
    agent_id: agentId,
    passport_id: passport?.id,
    source_context: externalSourceContext || null,
    purpose: passport ? passport.authorized_purpose : userGoal,
    tool: proposedTool,
    destination: proposedDestination,
    risk: riskScore,
    decision,
    execution_status: decision === 'ALLOW' ? 'ALLOWED' : decision === 'REVIEW' ? 'REVIEW_PENDING' : 'BLOCKED',
    policy_version: passport?.policy_version || 'v1.0',
    parameter_hash: parameterHash,
    metadata: {
      riskLevel,
      factors: riskEval.triggeredFactors,
      driftScore: driftAnalysis.purposeDriftScore,
      adversarial: adversarialAnalysis.attackType
    },
    timestamp: new Date().toISOString()
  };
  store.addLedgerEvent(ledgerEvent);

  // 11. If BLOCK: Record Security Incident
  if (decision === 'BLOCK') {
    const incident: Incident = {
      id: uuidv4(),
      user_id: userId,
      ledger_event_id: ledgerEvent.id,
      severity: riskLevel,
      category: adversarialAnalysis.untrustedInstructionDetected
        ? 'INDIRECT_PROMPT_INJECTION'
        : isExternalDestination
        ? 'DATA_EXFILTRATION_ATTEMPT'
        : 'PURPOSE_DRIFT_VIOLATION',
      title: `Blocked ${proposedTool} directed at ${proposedDestination}`,
      description: `ScopeSeal intercepted an unauthorized operation violating Purpose Passport '${passportCode}'. ${uniqueReasons.slice(0, 2).join(' ')}`,
      remediation: 'Ensure agent actions strictly follow authorized recruitment screening purpose. If legitimate, update passport or request human approval ticket.',
      forensic_metadata: {
        agentId,
        tool: proposedTool,
        destination: proposedDestination,
        parameterHash,
        reasons: uniqueReasons,
        driftAnalysis,
        adversarialAnalysis
      },
      created_at: new Date().toISOString()
    };
    store.addIncident(incident);
  }

  return {
    riskScore,
    riskLevel,
    decision,
    reasons: uniqueReasons,
    triggeredFactors: riskEval.triggeredFactors,
    policyViolations,
    purposeDriftDetected: driftAnalysis.purposeDriftDetected,
    purposeDriftScore: driftAnalysis.purposeDriftScore,
    semanticAlignmentScore: driftAnalysis.semanticAlignmentScore,
    detectedSensitiveFields: sensitivityAnalysis.detectedSensitiveFields,
    untrustedInstructionDetected: adversarialAnalysis.untrustedInstructionDetected,
    parameterHash,
    requiresApproval: decision === 'REVIEW',
    approvalId,
    ledgerId: ledgerEvent.id,
    explanation
  };
}

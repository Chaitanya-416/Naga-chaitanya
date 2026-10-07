import {
  RiskLevel,
  Decision,
  PolicyWeights,
  PolicyThresholds,
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_RISK_THRESHOLDS
} from '@scopeseal/shared';

export interface EvaluatedRiskFactors {
  purposeMismatch: boolean;
  sensitiveDataExposure: boolean;
  externalDestination: boolean;
  highImpactOperation: boolean;
  untrustedInstructionSource: boolean;
  excessiveScope: boolean;
  missingOrInvalidApproval: boolean;
}

export interface RiskEvaluationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  decision: Decision;
  triggeredFactors: Record<string, number>;
  reasons: string[];
}

export function evaluateRisk(
  factors: EvaluatedRiskFactors,
  weights: PolicyWeights = DEFAULT_RISK_WEIGHTS,
  thresholds: PolicyThresholds = DEFAULT_RISK_THRESHOLDS,
  isLowImpactRead: boolean = false
): RiskEvaluationResult {
  const triggeredFactors: Record<string, number> = {};
  const reasons: string[] = [];
  let totalScore = 0;

  if (factors.purposeMismatch) {
    triggeredFactors.PURPOSE_MISMATCH = weights.PURPOSE_MISMATCH;
    totalScore += weights.PURPOSE_MISMATCH;
    reasons.push(`Purpose drift detected: action diverges from authorized purpose (+${weights.PURPOSE_MISMATCH})`);
  }

  if (factors.sensitiveDataExposure) {
    triggeredFactors.SENSITIVE_DATA_EXPOSURE = weights.SENSITIVE_DATA_EXPOSURE;
    totalScore += weights.SENSITIVE_DATA_EXPOSURE;
    reasons.push(`Sensitive data exposure detected (+${weights.SENSITIVE_DATA_EXPOSURE})`);
  }

  if (factors.externalDestination) {
    triggeredFactors.EXTERNAL_DESTINATION = weights.EXTERNAL_DESTINATION;
    totalScore += weights.EXTERNAL_DESTINATION;
    reasons.push(`Action targets an external or untrusted destination (+${weights.EXTERNAL_DESTINATION})`);
  }

  if (factors.highImpactOperation) {
    triggeredFactors.HIGH_IMPACT_OPERATION = weights.HIGH_IMPACT_OPERATION;
    totalScore += weights.HIGH_IMPACT_OPERATION;
    reasons.push(`High impact state-changing or exfiltration tool requested (+${weights.HIGH_IMPACT_OPERATION})`);
  }

  if (factors.untrustedInstructionSource) {
    triggeredFactors.UNTRUSTED_INSTRUCTION_SOURCE = weights.UNTRUSTED_INSTRUCTION_SOURCE;
    totalScore += weights.UNTRUSTED_INSTRUCTION_SOURCE;
    reasons.push(`Instruction originates from untrusted external context or injection attempt (+${weights.UNTRUSTED_INSTRUCTION_SOURCE})`);
  }

  if (factors.excessiveScope) {
    triggeredFactors.EXCESSIVE_SCOPE = weights.EXCESSIVE_SCOPE;
    totalScore += weights.EXCESSIVE_SCOPE;
    reasons.push(`Excessive record count or field scope requested beyond passport (+${weights.EXCESSIVE_SCOPE})`);
  }

  if (factors.missingOrInvalidApproval) {
    triggeredFactors.MISSING_OR_INVALID_APPROVAL = weights.MISSING_OR_INVALID_APPROVAL;
    totalScore += weights.MISSING_OR_INVALID_APPROVAL;
    reasons.push(`Required human approval token missing, expired, or tampered (+${weights.MISSING_OR_INVALID_APPROVAL})`);
  }

  const riskScore = Math.min(100, Math.max(0, totalScore));

  let riskLevel: RiskLevel;
  if (riskScore <= thresholds.LOW_MAX) {
    riskLevel = 'LOW';
  } else if (riskScore <= thresholds.MEDIUM_MAX) {
    riskLevel = 'MEDIUM';
  } else if (riskScore <= thresholds.HIGH_MAX) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'CRITICAL';
  }

  // Decision Policy Mapping
  let decision: Decision;
  if (riskLevel === 'LOW') {
    decision = 'ALLOW';
  } else if (riskLevel === 'MEDIUM') {
    decision = isLowImpactRead ? 'ALLOW' : 'REVIEW';
  } else if (riskLevel === 'HIGH') {
    decision = 'REVIEW';
  } else {
    decision = 'BLOCK';
  }

  return {
    riskScore,
    riskLevel,
    decision,
    triggeredFactors,
    reasons
  };
}

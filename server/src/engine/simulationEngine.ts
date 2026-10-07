import {
  RunSimulationInput,
  SimulationResult,
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_RISK_THRESHOLDS
} from '@scopeseal/shared';
import { evaluateRisk, EvaluatedRiskFactors } from './riskEngine.js';
import { store } from '../services/store.service.js';

export function runPolicySimulation(
  userId: string,
  input: RunSimulationInput
): SimulationResult {
  const { originalAction, modifiedPolicy } = input;
  const activePolicy = store.getActivePolicy(userId);

  // Baseline Evaluation
  const baselineWeights = activePolicy.weights;
  const baselineThresholds = activePolicy.thresholds;

  const isExternalBaseline = !originalAction.proposedDestination.startsWith('internal://');
  const isHighImpactBaseline = ['export_report', 'send_email'].includes(originalAction.proposedTool);

  const baselineFactors: EvaluatedRiskFactors = {
    purposeMismatch: false,
    sensitiveDataExposure: false,
    externalDestination: isExternalBaseline,
    highImpactOperation: isHighImpactBaseline,
    untrustedInstructionSource: false,
    excessiveScope: false,
    missingOrInvalidApproval: false
  };

  const baselineResult = evaluateRisk(baselineFactors, baselineWeights, baselineThresholds);

  // Simulated Evaluation with Overrides
  const simulatedWeights = {
    ...baselineWeights,
    ...(modifiedPolicy.weights || {})
  };

  const simulatedThresholds = {
    ...baselineThresholds,
    ...(modifiedPolicy.thresholds || {})
  };

  const trustedDestinations = modifiedPolicy.trustedDestinations || [
    'internal://db/shortlists',
    'internal://storage/reports'
  ];

  const isSimulatedExternal = !trustedDestinations.some((d) =>
    originalAction.proposedDestination.toLowerCase().includes(d.toLowerCase())
  );

  const allowedOps = modifiedPolicy.allowedOperations || [
    'read_resume',
    'search_internal_candidates',
    'create_shortlist'
  ];

  const simulatedPurposeMismatch = !allowedOps.includes(originalAction.proposedTool);

  const simulatedFactors: EvaluatedRiskFactors = {
    purposeMismatch: simulatedPurposeMismatch,
    sensitiveDataExposure: baselineFactors.sensitiveDataExposure,
    externalDestination: isSimulatedExternal,
    highImpactOperation: baselineFactors.highImpactOperation,
    untrustedInstructionSource: baselineFactors.untrustedInstructionSource,
    excessiveScope: baselineFactors.excessiveScope,
    missingOrInvalidApproval: baselineFactors.missingOrInvalidApproval
  };

  const simulatedResult = evaluateRisk(simulatedFactors, simulatedWeights, simulatedThresholds);

  const simulatedViolations: string[] = [];
  if (simulatedPurposeMismatch) {
    simulatedViolations.push(`Tool '${originalAction.proposedTool}' is not included in simulated allowed operations.`);
  }
  if (isSimulatedExternal) {
    simulatedViolations.push(`Destination '${originalAction.proposedDestination}' is untrusted in simulated policy.`);
  }

  const scoreDelta = simulatedResult.riskScore - baselineResult.riskScore;
  const decisionChanged = simulatedResult.decision !== baselineResult.decision;

  return {
    simulatedRiskScore: simulatedResult.riskScore,
    simulatedRiskLevel: simulatedResult.riskLevel,
    simulatedDecision: simulatedResult.decision,
    simulatedReasons: simulatedResult.reasons,
    simulatedViolations,
    baselineRiskScore: baselineResult.riskScore,
    baselineDecision: baselineResult.decision,
    scoreDelta,
    decisionChanged,
    notes: 'Simulation only — no real tool execution and production policy is not mutated.'
  };
}

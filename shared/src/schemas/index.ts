import { z } from 'zod';
import {
  RISK_LEVELS,
  DECISIONS,
  SENSITIVITY_LEVELS,
  APPROVAL_STATUSES,
  EXECUTION_STATUSES
} from '../constants/index.js';

// --- Auth Schemas ---
export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RegisterInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional()
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

// --- Agent Schemas ---
export const AgentSchema = z.object({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  name: z.string().min(1),
  identifier: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().optional()
});
export type Agent = z.infer<typeof AgentSchema>;

// --- Data Asset Schemas ---
export const DataAssetSchema = z.object({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  data_type: z.string(),
  name: z.string(),
  sensitivity: z.enum(SENSITIVITY_LEVELS),
  metadata: z.record(z.any()).optional(),
  created_at: z.string()
});
export type DataAsset = z.infer<typeof DataAssetSchema>;

// --- Purpose Passport Schemas ---
export const PurposePassportInputSchema = z.object({
  agent_id: z.string().uuid(),
  data_asset_id: z.string().uuid().optional().nullable(),
  passport_code: z.string().min(3).max(64),
  data_type: z.string().default('synthetic_candidate_pool'),
  sensitivity_level: z.enum(SENSITIVITY_LEVELS).default('CONFIDENTIAL'),
  authorized_purpose: z.string().min(10, 'Authorized purpose must be at least 10 characters'),
  allowed_operations: z.array(z.string()).min(1, 'At least one allowed operation required'),
  allowed_fields: z.array(z.string()).min(1, 'At least one allowed field required'),
  allowed_destinations: z.array(z.string()).min(1, 'At least one allowed destination required'),
  allowed_agents: z.array(z.string()).optional(),
  approval_required: z.boolean().default(false),
  expires_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expiration ISO date'
  }),
  policy_version: z.string().default('v1.0'),
  active: z.boolean().default(true)
});
export type PurposePassportInput = z.infer<typeof PurposePassportInputSchema>;

export const PurposePassportSchema = PurposePassportInputSchema.extend({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string().optional()
});
export type PurposePassport = z.infer<typeof PurposePassportSchema>;

// --- Policy Schemas ---
export const PolicyWeightsSchema = z.object({
  PURPOSE_MISMATCH: z.number().min(0).max(100).default(25),
  SENSITIVE_DATA_EXPOSURE: z.number().min(0).max(100).default(20),
  EXTERNAL_DESTINATION: z.number().min(0).max(100).default(15),
  HIGH_IMPACT_OPERATION: z.number().min(0).max(100).default(15),
  UNTRUSTED_INSTRUCTION_SOURCE: z.number().min(0).max(100).default(10),
  EXCESSIVE_SCOPE: z.number().min(0).max(100).default(10),
  MISSING_OR_INVALID_APPROVAL: z.number().min(0).max(100).default(5)
});
export type PolicyWeights = z.infer<typeof PolicyWeightsSchema>;

export const PolicyThresholdsSchema = z.object({
  LOW_MAX: z.number().min(0).max(50).default(30),
  MEDIUM_MAX: z.number().min(31).max(80).default(60),
  HIGH_MAX: z.number().min(61).max(95).default(80)
});
export type PolicyThresholds = z.infer<typeof PolicyThresholdsSchema>;

export const PolicyInputSchema = z.object({
  name: z.string().min(2),
  weights: PolicyWeightsSchema,
  thresholds: PolicyThresholdsSchema,
  rules: z.record(z.any()).default({}),
  policy_version: z.string().default('v1.0'),
  active: z.boolean().default(true)
});
export type PolicyInput = z.infer<typeof PolicyInputSchema>;

export const PolicySchema = PolicyInputSchema.extend({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string().optional()
});
export type Policy = z.infer<typeof PolicySchema>;

// --- Gateway Action Evaluation Schemas ---
export const EvaluateActionInputSchema = z.object({
  agentId: z.string(),
  passportCode: z.string().min(1),
  taskId: z.string().optional(),
  userGoal: z.string().min(3, 'User goal is required'),
  proposedTool: z.string().min(1, 'Proposed tool is required'),
  proposedDestination: z.string().min(1, 'Destination is required'),
  parameters: z.record(z.any()).default({}),
  externalSourceContext: z.string().optional(), // Content originating from external resume/file/prompt
  approvalToken: z.string().optional()
});
export type EvaluateActionInput = z.infer<typeof EvaluateActionInputSchema>;

export const EvaluationResultSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(RISK_LEVELS),
  decision: z.enum(DECISIONS),
  reasons: z.array(z.string()),
  triggeredFactors: z.record(z.number()),
  policyViolations: z.array(z.string()),
  purposeDriftDetected: z.boolean(),
  purposeDriftScore: z.number().optional(),
  semanticAlignmentScore: z.number().optional(),
  detectedSensitiveFields: z.array(z.string()).default([]),
  untrustedInstructionDetected: z.boolean().default(false),
  parameterHash: z.string(),
  requiresApproval: z.boolean(),
  approvalId: z.string().uuid().optional().nullable(),
  ledgerId: z.string().uuid().optional(),
  explanation: z.string().optional()
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// --- Execute Action Schemas ---
export const ExecuteActionInputSchema = z.object({
  agentId: z.string(),
  passportCode: z.string(),
  userGoal: z.string(),
  proposedTool: z.string(),
  proposedDestination: z.string(),
  parameters: z.record(z.any()),
  parameterHash: z.string(),
  approvalId: z.string().uuid().optional(),
  externalSourceContext: z.string().optional()
});
export type ExecuteActionInput = z.infer<typeof ExecuteActionInputSchema>;

export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  decision: z.enum(DECISIONS),
  executionStatus: z.enum(EXECUTION_STATUSES),
  toolOutput: z.any().optional(),
  ledgerId: z.string().uuid().optional(),
  incidentId: z.string().uuid().optional(),
  errorMessage: z.string().optional()
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// --- Approvals Schemas ---
export const ApprovalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_id: z.string(),
  tool_id: z.string(),
  passport_id: z.string().uuid().optional().nullable(),
  target: z.string(),
  normalized_parameters: z.record(z.any()),
  parameter_hash: z.string(),
  status: z.enum(APPROVAL_STATUSES),
  risk_score: z.number(),
  reasons: z.array(z.string()),
  expires_at: z.string(),
  approved_at: z.string().optional().nullable(),
  used_at: z.string().optional().nullable(),
  created_at: z.string()
});
export type Approval = z.infer<typeof ApprovalSchema>;

// --- Data Flow Ledger Schemas ---
export const DataFlowEventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_id: z.string(),
  passport_id: z.string().uuid().optional().nullable(),
  source_context: z.string().optional().nullable(),
  purpose: z.string(),
  tool: z.string(),
  destination: z.string(),
  risk: z.number(),
  decision: z.enum(DECISIONS),
  execution_status: z.enum(EXECUTION_STATUSES),
  policy_version: z.string().default('v1.0'),
  parameter_hash: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string()
});
export type DataFlowEvent = z.infer<typeof DataFlowEventSchema>;

// --- Incident Schemas ---
export const IncidentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  ledger_event_id: z.string().uuid().optional().nullable(),
  severity: z.enum(RISK_LEVELS),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  remediation: z.string(),
  forensic_metadata: z.record(z.any()),
  created_at: z.string()
});
export type Incident = z.infer<typeof IncidentSchema>;

// --- Security Test Lab Schemas ---
export const RunTestScenarioInputSchema = z.object({
  scenarioId: z.string().min(1)
});
export type RunTestScenarioInput = z.infer<typeof RunTestScenarioInputSchema>;

export const SecurityTestResultSchema = z.object({
  id: z.string().uuid(),
  scenarioId: z.string(),
  scenarioName: z.string(),
  description: z.string(),
  threatCategory: z.string(),
  expectedDecision: z.enum(DECISIONS),
  observedDecision: z.enum(DECISIONS),
  riskScore: z.number(),
  passed: z.boolean(),
  reasons: z.array(z.string()),
  ledgerId: z.string().uuid().optional(),
  incidentId: z.string().uuid().optional(),
  created_at: z.string()
});
export type SecurityTestResult = z.infer<typeof SecurityTestResultSchema>;

// --- Policy Simulation Schemas ---
export const RunSimulationInputSchema = z.object({
  originalAction: EvaluateActionInputSchema,
  modifiedPolicy: z.object({
    weights: PolicyWeightsSchema.partial().optional(),
    thresholds: PolicyThresholdsSchema.partial().optional(),
    trustedDestinations: z.array(z.string()).optional(),
    allowedOperations: z.array(z.string()).optional()
  })
});
export type RunSimulationInput = z.infer<typeof RunSimulationInputSchema>;

export const SimulationResultSchema = z.object({
  simulatedRiskScore: z.number(),
  simulatedRiskLevel: z.enum(RISK_LEVELS),
  simulatedDecision: z.enum(DECISIONS),
  simulatedReasons: z.array(z.string()),
  simulatedViolations: z.array(z.string()),
  baselineRiskScore: z.number(),
  baselineDecision: z.enum(DECISIONS),
  scoreDelta: z.number(),
  decisionChanged: z.boolean(),
  notes: z.string()
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// --- Structured AI Schemas ---
export const PurposeExtractionOutputSchema = z.object({
  authorizedPurpose: z.string(),
  allowedOperations: z.array(z.string()),
  allowedScope: z.array(z.string()),
  likelyDestinations: z.array(z.string()),
  requiresApproval: z.boolean()
});
export type PurposeExtractionOutput = z.infer<typeof PurposeExtractionOutputSchema>;

export const PurposeDriftOutputSchema = z.object({
  semanticIntent: z.string(),
  semanticAlignmentScore: z.number().min(0).max(1),
  purposeDriftScore: z.number().min(0).max(1),
  purposeDriftDetected: z.boolean(),
  reasons: z.array(z.string())
});
export type PurposeDriftOutput = z.infer<typeof PurposeDriftOutputSchema>;

export const SensitivityClassificationOutputSchema = z.object({
  sensitivity: z.enum(SENSITIVITY_LEVELS),
  detectedSensitiveFields: z.array(z.string()),
  reasons: z.array(z.string())
});
export type SensitivityClassificationOutput = z.infer<typeof SensitivityClassificationOutputSchema>;

export const AdversarialDetectionOutputSchema = z.object({
  untrustedInstructionDetected: z.boolean(),
  attackType: z.enum(['NONE', 'INDIRECT_PROMPT_INJECTION', 'EXFILTRATION', 'OTHER']),
  reasons: z.array(z.string())
});
export type AdversarialDetectionOutput = z.infer<typeof AdversarialDetectionOutputSchema>;

export const ExplanationOutputSchema = z.object({
  summary: z.string(),
  keyReasons: z.array(z.string()),
  recommendedSecurityAction: z.enum(DECISIONS)
});
export type ExplanationOutput = z.infer<typeof ExplanationOutputSchema>;

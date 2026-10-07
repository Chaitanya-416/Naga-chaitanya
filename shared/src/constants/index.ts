export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const DECISIONS = ['ALLOW', 'REVIEW', 'BLOCK'] as const;
export type Decision = (typeof DECISIONS)[number];

export const SENSITIVITY_LEVELS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] as const;
export type SensitivityLevel = (typeof SENSITIVITY_LEVELS)[number];

export const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'USED'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const EXECUTION_STATUSES = [
  'PROPOSED',
  'ALLOWED',
  'BLOCKED',
  'REVIEW_PENDING',
  'EXECUTED',
  'FAILED'
] as const;
export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export const DEFAULT_RISK_WEIGHTS = {
  PURPOSE_MISMATCH: 25,
  SENSITIVE_DATA_EXPOSURE: 20,
  EXTERNAL_DESTINATION: 15,
  HIGH_IMPACT_OPERATION: 15,
  UNTRUSTED_INSTRUCTION_SOURCE: 10,
  EXCESSIVE_SCOPE: 10,
  MISSING_OR_INVALID_APPROVAL: 5
} as const;

export const DEFAULT_RISK_THRESHOLDS = {
  LOW_MAX: 30,
  MEDIUM_MAX: 60,
  HIGH_MAX: 80
} as const;

export interface RegisteredToolDefinition {
  name: string;
  operationClass: 'read' | 'write' | 'export' | 'external';
  riskClass: RiskLevel;
  description: string;
  allowedDestinations?: string[];
}

export const RECRUIT_ASSIST_TOOLS: Record<string, RegisteredToolDefinition> = {
  read_resume: {
    name: 'read_resume',
    operationClass: 'read',
    riskClass: 'LOW',
    description: 'Read candidate resume profile from internal synthetic candidates'
  },
  search_internal_candidates: {
    name: 'search_internal_candidates',
    operationClass: 'read',
    riskClass: 'LOW',
    description: 'Query internal candidate database by skills or experience'
  },
  create_shortlist: {
    name: 'create_shortlist',
    operationClass: 'write',
    riskClass: 'MEDIUM',
    description: 'Create an internal screening shortlist'
  },
  save_report: {
    name: 'save_report',
    operationClass: 'write',
    riskClass: 'MEDIUM',
    description: 'Save an internal candidate evaluation report'
  },
  create_calendar_event: {
    name: 'create_calendar_event',
    operationClass: 'write',
    riskClass: 'MEDIUM',
    description: 'Schedule an internal candidate interview event'
  },
  send_email: {
    name: 'send_email',
    operationClass: 'external',
    riskClass: 'HIGH',
    description: 'Send external notification email'
  },
  export_report: {
    name: 'export_report',
    operationClass: 'export',
    riskClass: 'HIGH',
    description: 'Export report data to external recipient or endpoint'
  }
};

export const TRUSTED_INTERNAL_DESTINATIONS = [
  'internal://db/shortlists',
  'internal://storage/reports',
  'internal://calendar/schedules',
  'internal://audit/logs'
];

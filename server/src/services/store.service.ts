import { v4 as uuidv4 } from 'uuid';
import {
  PurposePassport,
  PurposePassportInput,
  Policy,
  PolicyInput,
  Agent,
  DataAsset,
  Approval,
  DataFlowEvent,
  Incident,
  SecurityTestResult,
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_RISK_THRESHOLDS,
  RECRUIT_ASSIST_TOOLS,
  TRUSTED_INTERNAL_DESTINATIONS
} from '@scopeseal/shared';
import { DEMO_USER_ID } from '../middleware/auth.middleware.js';

export interface SyntheticCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  experienceYears: number;
  education: string;
  resumeText: string;
  internalNotes: string;
  sensitivity: 'CONFIDENTIAL' | 'RESTRICTED';
}

class ScopeSealStore {
  private agents: Map<string, Agent> = new Map();
  private dataAssets: Map<string, DataAsset> = new Map();
  private passports: Map<string, PurposePassport> = new Map();
  private policies: Map<string, Policy> = new Map();
  private approvals: Map<string, Approval> = new Map();
  private ledgerEvents: Map<string, DataFlowEvent> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private securityTests: Map<string, SecurityTestResult> = new Map();
  private syntheticCandidates: Map<string, SyntheticCandidate> = new Map();

  constructor() {
    this.seedDefaults();
  }

  public resetDemoData(): void {
    this.agents.clear();
    this.dataAssets.clear();
    this.passports.clear();
    this.policies.clear();
    this.approvals.clear();
    this.ledgerEvents.clear();
    this.incidents.clear();
    this.securityTests.clear();
    this.syntheticCandidates.clear();
    this.seedDefaults();
  }

  private seedDefaults(): void {
    // 1. Synthetic Candidates
    const candidates: SyntheticCandidate[] = [
      {
        id: 'cand-001',
        name: 'Alice Smith',
        email: 'alice.smith@example.test',
        phone: '+1-555-0101',
        role: 'Senior Backend Engineer',
        skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems'],
        experienceYears: 7,
        education: 'B.S. Computer Science, MIT',
        resumeText: 'Passionate distributed systems engineer with 7 years architecting high-throughput data processing pipelines in Node.js and PostgreSQL. Designed fault-tolerant microservices and low-latency APIs.',
        internalNotes: 'Strong algorithmic skills, passed preliminary screening.',
        sensitivity: 'CONFIDENTIAL'
      },
      {
        id: 'cand-002',
        name: 'Bob Chen',
        email: 'bob.chen@example.test',
        phone: '+1-555-0102',
        role: 'AI / ML Infrastructure Engineer',
        skills: ['Python', 'PyTorch', 'Vector Databases', 'LangChain', 'Kubernetes'],
        experienceYears: 5,
        education: 'M.S. Artificial Intelligence, Stanford',
        resumeText: 'Machine learning engineer experienced in deploying LLM inference pipelines, fine-tuning embedding models, and securing vector databases. Built scalable retrieval engines for enterprise search.',
        internalNotes: 'Top pick for AI security research role.',
        sensitivity: 'CONFIDENTIAL'
      },
      {
        id: 'cand-003',
        name: 'Charlie Davis',
        email: 'charlie.davis@example.test',
        phone: '+1-555-0103',
        role: 'Application Security Engineer',
        skills: ['AppSec', 'Threat Modeling', 'OWASP Top 10', 'Penetration Testing'],
        experienceYears: 6,
        education: 'B.S. Cybersecurity, Georgia Tech',
        resumeText: 'Application security engineer specializing in red-teaming AI agents, prompt injection defense, and cryptographic zero-trust architectures. Extensive experience in SAST/DAST automation.',
        internalNotes: 'Demonstrated exceptional vulnerability assessment depth.',
        sensitivity: 'RESTRICTED'
      },
      {
        id: 'cand-004',
        name: 'Dana Vance',
        email: 'dana.vance@example.test',
        phone: '+1-555-0104',
        role: 'Frontend Architect',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
        experienceYears: 8,
        education: 'B.A. Graphic Design & Computer Science, Berkeley',
        resumeText: 'Frontend architect obsessed with high-fidelity UI/UX, micro-interactions, responsive design systems, and state management at scale.',
        internalNotes: 'Created award-winning developer tool dashboards.',
        sensitivity: 'CONFIDENTIAL'
      }
    ];

    for (const c of candidates) {
      this.syntheticCandidates.set(c.id, c);
    }

    // 2. Default RecruitAssist Agent
    const agentId = 'b0000000-0000-0000-0000-000000000001';
    const defaultAgent: Agent = {
      id: agentId,
      owner_user_id: DEMO_USER_ID,
      name: 'RecruitAssist',
      identifier: 'recruit-assist',
      description: 'Autonomous Candidate Screening and Shortlisting Assistant',
      active: true,
      created_at: new Date().toISOString()
    };
    this.agents.set(defaultAgent.id, defaultAgent);

    // 3. Default Data Asset
    const assetId = 'c0000000-0000-0000-0000-000000000001';
    const candidatePoolAsset: DataAsset = {
      id: assetId,
      owner_user_id: DEMO_USER_ID,
      data_type: 'synthetic_candidate_pool',
      name: 'Synthetic Engineering Candidate Pool 2026',
      sensitivity: 'CONFIDENTIAL',
      metadata: { recordCount: candidates.length, classification: 'CONFIDENTIAL' },
      created_at: new Date().toISOString()
    };
    this.dataAssets.set(candidatePoolAsset.id, candidatePoolAsset);

    // 4. Default Purpose Passport (PSP-HR-SCREEN-2026)
    const passportId = 'd0000000-0000-0000-0000-000000000001';
    const defaultPassport: PurposePassport = {
      id: passportId,
      owner_user_id: DEMO_USER_ID,
      agent_id: agentId,
      data_asset_id: assetId,
      passport_code: 'PSP-HR-SCREEN-2026',
      data_type: 'synthetic_candidate_pool',
      sensitivity_level: 'CONFIDENTIAL',
      authorized_purpose: 'Candidate screening and internal shortlist creation for open software engineering roles',
      allowed_operations: [
        'read_resume',
        'search_internal_candidates',
        'create_shortlist',
        'save_report',
        'create_calendar_event'
      ],
      allowed_fields: [
        'candidate_name',
        'skills',
        'experience_years',
        'education',
        'screening_notes'
      ],
      allowed_destinations: [
        'internal://db/shortlists',
        'internal://storage/reports',
        'internal://calendar/schedules'
      ],
      allowed_agents: ['recruit-assist'],
      approval_required: false,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      policy_version: 'v1.0',
      active: true,
      created_at: new Date().toISOString()
    };
    this.passports.set(defaultPassport.id, defaultPassport);

    // 5. Default Zero-Trust Policy
    const policyId = 'e0000000-0000-0000-0000-000000000001';
    const defaultPolicy: Policy = {
      id: policyId,
      owner_user_id: DEMO_USER_ID,
      name: 'Default Zero-Trust Hiring Policy',
      weights: { ...DEFAULT_RISK_WEIGHTS },
      thresholds: { ...DEFAULT_RISK_THRESHOLDS },
      rules: {
        trustedDestinations: [...TRUSTED_INTERNAL_DESTINATIONS],
        externalEmailRequiresApproval: true,
        exportReportRequiresApproval: true
      },
      policy_version: 'v1.0',
      active: true,
      created_at: new Date().toISOString()
    };
    this.policies.set(defaultPolicy.id, defaultPolicy);
  }

  // Candidates
  public getCandidates(): SyntheticCandidate[] {
    return Array.from(this.syntheticCandidates.values());
  }

  public getCandidateById(id: string): SyntheticCandidate | undefined {
    return this.syntheticCandidates.get(id);
  }

  // Agents
  public getAgents(userId: string): Agent[] {
    return Array.from(this.agents.values()).filter((a) => a.owner_user_id === userId || a.owner_user_id === DEMO_USER_ID);
  }

  public createAgent(userId: string, data: Omit<Agent, 'id' | 'owner_user_id' | 'created_at'>): Agent {
    const agent: Agent = {
      id: uuidv4(),
      owner_user_id: userId,
      ...data,
      created_at: new Date().toISOString()
    };
    this.agents.set(agent.id, agent);
    return agent;
  }

  // Passports
  public getPassports(userId: string): PurposePassport[] {
    return Array.from(this.passports.values()).filter((p) => p.owner_user_id === userId || p.owner_user_id === DEMO_USER_ID);
  }

  public getPassportById(id: string): PurposePassport | undefined {
    return this.passports.get(id);
  }

  public getPassportByCode(code: string): PurposePassport | undefined {
    return Array.from(this.passports.values()).find((p) => p.passport_code.toLowerCase() === code.toLowerCase());
  }

  public createPassport(userId: string, input: PurposePassportInput): PurposePassport {
    const passport: PurposePassport = {
      id: uuidv4(),
      owner_user_id: userId,
      ...input,
      created_at: new Date().toISOString()
    };
    this.passports.set(passport.id, passport);
    return passport;
  }

  public updatePassport(id: string, userId: string, update: Partial<PurposePassportInput>): PurposePassport | null {
    const existing = this.passports.get(id);
    if (!existing) return null;
    if (existing.owner_user_id !== userId && existing.owner_user_id !== DEMO_USER_ID) return null;

    const updated: PurposePassport = {
      ...existing,
      ...update,
      updated_at: new Date().toISOString()
    };
    this.passports.set(id, updated);
    return updated;
  }

  public deletePassport(id: string, userId: string): boolean {
    const existing = this.passports.get(id);
    if (!existing) return false;
    if (existing.owner_user_id !== userId && existing.owner_user_id !== DEMO_USER_ID) return false;
    return this.passports.delete(id);
  }

  // Policies
  public getPolicies(userId: string): Policy[] {
    return Array.from(this.policies.values()).filter((p) => p.owner_user_id === userId || p.owner_user_id === DEMO_USER_ID);
  }

  public getActivePolicy(userId: string): Policy {
    const policies = this.getPolicies(userId);
    return policies.find((p) => p.active) || Array.from(this.policies.values())[0];
  }

  public updatePolicy(id: string, userId: string, update: Partial<PolicyInput>): Policy | null {
    const existing = this.policies.get(id);
    if (!existing) return null;
    const updated: Policy = {
      ...existing,
      ...update,
      updated_at: new Date().toISOString()
    };
    this.policies.set(id, updated);
    return updated;
  }

  // Approvals
  public getApprovals(userId: string): Approval[] {
    return Array.from(this.approvals.values()).filter((a) => a.user_id === userId || a.user_id === DEMO_USER_ID);
  }

  public getApprovalById(id: string): Approval | undefined {
    return this.approvals.get(id);
  }

  public createApproval(approval: Approval): Approval {
    this.approvals.set(approval.id, approval);
    return approval;
  }

  public updateApproval(id: string, update: Partial<Approval>): Approval | null {
    const existing = this.approvals.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...update };
    this.approvals.set(id, updated);
    return updated;
  }

  // Ledger
  public getLedgerEvents(userId: string): DataFlowEvent[] {
    return Array.from(this.ledgerEvents.values())
      .filter((e) => e.user_id === userId || e.user_id === DEMO_USER_ID)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addLedgerEvent(event: DataFlowEvent): DataFlowEvent {
    this.ledgerEvents.set(event.id, event);
    return event;
  }

  // Incidents
  public getIncidents(userId: string): Incident[] {
    return Array.from(this.incidents.values())
      .filter((i) => i.user_id === userId || i.user_id === DEMO_USER_ID)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addIncident(incident: Incident): Incident {
    this.incidents.set(incident.id, incident);
    return incident;
  }

  // Security Tests
  public getSecurityTests(userId: string): SecurityTestResult[] {
    return Array.from(this.securityTests.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addSecurityTest(test: SecurityTestResult): SecurityTestResult {
    this.securityTests.set(test.id, test);
    return test;
  }
}

export const store = new ScopeSealStore();

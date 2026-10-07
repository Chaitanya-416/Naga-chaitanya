-- ============================================================================
-- ScopeSeal AI - Initial Production Database Schema & RLS Policies
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- Ensure pgcrypto / uuid-ossp extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE decision_enum AS ENUM ('ALLOW', 'REVIEW', 'BLOCK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'USED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sensitivity_enum AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE execution_status_enum AS ENUM ('PROPOSED', 'ALLOWED', 'BLOCKED', 'REVIEW_PENDING', 'EXECUTED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- Tools Table (Registered tools for agent safety boundary)
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    operation_class TEXT NOT NULL CHECK (operation_class IN ('read', 'write', 'export', 'external')),
    risk_class risk_level_enum NOT NULL DEFAULT 'LOW',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL,
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Data Assets Table
CREATE TABLE IF NOT EXISTS data_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL,
    data_type TEXT NOT NULL,
    name TEXT NOT NULL,
    sensitivity sensitivity_enum NOT NULL DEFAULT 'CONFIDENTIAL',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Purpose Passports Table
CREATE TABLE IF NOT EXISTS purpose_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    data_asset_id UUID REFERENCES data_assets(id) ON DELETE SET NULL,
    passport_code TEXT NOT NULL,
    data_type TEXT NOT NULL DEFAULT 'synthetic_candidate_pool',
    sensitivity_level sensitivity_enum NOT NULL DEFAULT 'CONFIDENTIAL',
    authorized_purpose TEXT NOT NULL,
    allowed_operations TEXT[] NOT NULL DEFAULT '{}',
    allowed_fields TEXT[] NOT NULL DEFAULT '{}',
    allowed_destinations TEXT[] NOT NULL DEFAULT '{}',
    allowed_agents TEXT[] DEFAULT '{}',
    approval_required BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    policy_version TEXT NOT NULL DEFAULT 'v1.0',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_owner_passport_code UNIQUE (owner_user_id, passport_code)
);

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL,
    name TEXT NOT NULL,
    weights JSONB NOT NULL DEFAULT '{"PURPOSE_MISMATCH": 25, "SENSITIVE_DATA_EXPOSURE": 20, "EXTERNAL_DESTINATION": 15, "HIGH_IMPACT_OPERATION": 15, "UNTRUSTED_INSTRUCTION_SOURCE": 10, "EXCESSIVE_SCOPE": 10, "MISSING_OR_INVALID_APPROVAL": 5}'::jsonb,
    thresholds JSONB NOT NULL DEFAULT '{"LOW_MAX": 30, "MEDIUM_MAX": 60, "HIGH_MAX": 80}'::jsonb,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    policy_version TEXT NOT NULL DEFAULT 'v1.0',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    original_goal TEXT NOT NULL,
    authorized_purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Tool Actions Table
CREATE TABLE IF NOT EXISTS tool_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    source_context TEXT,
    requested_operation TEXT NOT NULL,
    destination TEXT NOT NULL,
    normalized_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    parameter_hash TEXT NOT NULL,
    sensitivity sensitivity_enum NOT NULL DEFAULT 'INTERNAL',
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    risk_level risk_level_enum NOT NULL DEFAULT 'LOW',
    decision decision_enum NOT NULL DEFAULT 'ALLOW',
    execution_status execution_status_enum NOT NULL DEFAULT 'PROPOSED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    passport_id UUID REFERENCES purpose_passports(id) ON DELETE SET NULL,
    target TEXT NOT NULL,
    normalized_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    parameter_hash TEXT NOT NULL,
    status approval_status_enum NOT NULL DEFAULT 'PENDING',
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    reasons TEXT[] NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    approved_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Data Flow Events Table (The immutable audit ledger)
CREATE TABLE IF NOT EXISTS data_flow_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    passport_id UUID REFERENCES purpose_passports(id) ON DELETE SET NULL,
    source_context TEXT,
    purpose TEXT NOT NULL,
    tool TEXT NOT NULL,
    destination TEXT NOT NULL,
    risk NUMERIC(5,2) NOT NULL DEFAULT 0,
    decision decision_enum NOT NULL DEFAULT 'ALLOW',
    execution_status execution_status_enum NOT NULL DEFAULT 'PROPOSED',
    policy_version TEXT NOT NULL DEFAULT 'v1.0',
    parameter_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ledger_event_id UUID REFERENCES data_flow_events(id) ON DELETE SET NULL,
    severity risk_level_enum NOT NULL DEFAULT 'HIGH',
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    remediation TEXT NOT NULL,
    forensic_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Audit Events Table (System-level operational audit)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    actor_type TEXT NOT NULL DEFAULT 'user',
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Security Tests Table
CREATE TABLE IF NOT EXISTS security_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    scenario_id TEXT NOT NULL,
    scenario_name TEXT NOT NULL,
    description TEXT,
    threat_category TEXT NOT NULL,
    expected_decision decision_enum NOT NULL,
    observed_decision decision_enum NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    reasons TEXT[] DEFAULT '{}',
    ledger_id UUID REFERENCES data_flow_events(id) ON DELETE SET NULL,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Policy Simulations Table
CREATE TABLE IF NOT EXISTS policy_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    source_action_id UUID,
    proposed_policy JSONB NOT NULL,
    simulated_risk NUMERIC(5,2) NOT NULL,
    simulated_decision decision_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE & AUDIT
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_passports_owner ON purpose_passports(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_passports_code ON purpose_passports(passport_code);
CREATE INDEX IF NOT EXISTS idx_policies_owner ON policies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_user_hash ON approvals(user_id, parameter_hash);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_ledger_user_time ON data_flow_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_decision ON data_flow_events(decision);
CREATE INDEX IF NOT EXISTS idx_incidents_user_time ON incidents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON audit_events(user_id, created_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE purpose_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_flow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_simulations ENABLE ROW LEVEL SECURITY;
-- Tools table is system-wide readable by authenticated users
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Tools RLS Policy (read-only for authenticated users)
CREATE POLICY "Tools readable by authenticated users"
    ON tools FOR SELECT
    TO authenticated
    USING (true);

-- Agents RLS Policies
CREATE POLICY "Agents owned by user"
    ON agents FOR ALL
    TO authenticated
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- Data Assets RLS Policies
CREATE POLICY "Data assets owned by user"
    ON data_assets FOR ALL
    TO authenticated
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- Purpose Passports RLS Policies
CREATE POLICY "Passports owned by user"
    ON purpose_passports FOR ALL
    TO authenticated
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- Policies RLS Policies
CREATE POLICY "Policies owned by user"
    ON policies FOR ALL
    TO authenticated
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- Tasks RLS Policies
CREATE POLICY "Tasks owned by user"
    ON tasks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tool Actions RLS Policies
CREATE POLICY "Tool actions owned by user"
    ON tool_actions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Approvals RLS Policies
CREATE POLICY "Approvals owned by user"
    ON approvals FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Data Flow Events RLS Policies
CREATE POLICY "Ledger events owned by user"
    ON data_flow_events FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Incidents RLS Policies
CREATE POLICY "Incidents owned by user"
    ON incidents FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Audit Events RLS Policies
CREATE POLICY "Audit events owned by user"
    ON audit_events FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Security Tests RLS Policies
CREATE POLICY "Security tests owned by user"
    ON security_tests FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy Simulations RLS Policies
CREATE POLICY "Simulations owned by user"
    ON policy_simulations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. SYSTEM SEED DATA (Tools Registry)
-- ============================================================================

INSERT INTO tools (name, operation_class, risk_class, description, active)
VALUES
    ('read_resume', 'read', 'LOW', 'Read candidate resume profile from internal synthetic candidates', true),
    ('search_internal_candidates', 'read', 'LOW', 'Query internal candidate database by skills or experience', true),
    ('create_shortlist', 'write', 'MEDIUM', 'Create an internal screening shortlist', true),
    ('save_report', 'write', 'MEDIUM', 'Save an internal candidate evaluation report', true),
    ('create_calendar_event', 'write', 'MEDIUM', 'Schedule an internal candidate interview event', true),
    ('send_email', 'external', 'HIGH', 'Send external notification email', true),
    ('export_report', 'export', 'HIGH', 'Export report data to external recipient or endpoint', true)
ON CONFLICT (name) DO NOTHING;

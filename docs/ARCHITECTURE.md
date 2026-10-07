# ScopeSeal AI — System Architecture & Engineering Blueprint

## Executive Overview
**ScopeSeal AI** is a runtime Purpose-Bound Data Firewall for AI agents. Traditional access control (RBAC/ABAC) answers **WHO** has permission to access a data repository. ScopeSeal AI enforces **WHY, WHAT, WHERE, and WHEN** an agent may interact with protected data.

```
USER
  ↓
AI AGENT (RecruitAssist)
  ↓
PROPOSED ACTION
  ↓
================ SCOPESEAL GATEWAY (Zero-Trust Boundary) ================
  ↓
AI SEMANTIC ANALYSIS (Gemini) + DETERMINISTIC SECURITY CONTROLS
  ↓
SCHEMA VALIDATION (Zod)
  ↓
NORMALIZATION & CANONICAL HASH BINDING (SHA-256)
  ↓
DETERMINISTIC POLICY EVALUATION (Weights & Thresholds)
  ↓
AUTHORIZATION ENGINE
  ↓
DECISION: ALLOW / REVIEW / BLOCK
  ↓
TOOL EXECUTION (Restricted Sandbox)
  ↓
DATA FLOW LEDGER (Immutable PostgreSQL Audit Event)
  ↓
INCIDENT & FORENSIC RECORD (On Blocked Attacks)
```

---

## 1. Core Security Pipeline

### 1.1 Strict Order of Enforcement
1. **Agent Proposal Interception**: The agent cannot execute tools directly. Tool execution capabilities are abstracted behind the ScopeSeal Gateway.
2. **AI Semantic Analysis**: Google Gemini (`@google/genai`) analyzes the request to compute semantic intent, detect subtle purpose drift, classify data sensitivity, and detect adversarial instructions.
3. **Deterministic Primacy & Fail-Closed Guarantee**: The LLM *never* makes the authorization decision. Its outputs are validated against strict Zod schemas and fed as input factors into the deterministic risk engine. If the AI service is unavailable or degraded, ScopeSeal fails closed to a deterministic heuristic fallback engine.
4. **Parameter Normalization & Hash Binding**: Parameters are canonicalized recursively, and a SHA-256 parameter hash is bound to the exact actor, tool, target, and payload.
5. **Deterministic Policy Evaluation**: Triggered risk factors are multiplied by configured weights. Total risk score (0–100) maps deterministically to LOW, MEDIUM, HIGH, or CRITICAL.
6. **Decision Verdict**:
   - **LOW (0–30)**: `ALLOW` if no absolute policy violations exist. Tool executes, event logged to ledger.
   - **MEDIUM (31–60)**: `ALLOW` for low-impact reads; `REVIEW` for state-changing or external operations.
   - **HIGH (61–80)**: `REVIEW`. Requires a single-use parameter-bound cryptographic approval.
   - **CRITICAL (81–100)**: `BLOCK`. Immediate execution termination and forensic incident creation.

---

## 2. Component Taxonomy

### 2.1 Purpose Passports
A Purpose Passport is a cryptographically verifiable contract specifying:
- **`passport_code`**: Unique identifier (e.g. `PSP-HR-SCREEN-2026`).
- **`authorized_purpose`**: Contractual human objective.
- **`allowed_operations`**: Whitelisted tools (e.g. `read_resume`, `create_shortlist`).
- **`allowed_destinations`**: Whitelisted internal/external targets.
- **`sensitivity_level`**: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED.
- **`expires_at`**: Strict expiration timestamp.

### 2.2 Parameter-Bound Approval Engine
When an action requires human review, ScopeSeal generates a single-use approval ticket bound to:
$$\text{Hash} = \text{SHA-256}(\text{agentId} \parallel \text{tool} \parallel \text{destination} \parallel \text{CanonicalParams})$$
- **Anti-Mutation**: Any parameter or destination change after approval causes an immediate hash mismatch and `BLOCK`.
- **Anti-Replay**: Once an approval is executed, it is atomically transitioned to `USED`. Replaying the token triggers an immediate `BLOCK`.
- **Anti-Stale**: Approvals have a strict TTL expiration (default 10 minutes).

### 2.3 What-If Policy Simulation
Security administrators can simulate adjustments to weights, thresholds, and trusted destinations in an isolated sandbox. The engine calculates risk deltas and counterfactual decisions without executing tools or altering live production policies.
